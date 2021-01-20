package com.manipal.insurance.service

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.manipal.insurance.dao.Dao
import com.mongodb.client.model.Accumulators
import com.mongodb.client.model.Aggregates
import com.mongodb.client.model.Field
import okhttp3.MediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import org.bson.Document
import org.bson.conversions.Bson
import org.json.JSONArray
import org.json.JSONObject
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Service
import java.io.UnsupportedEncodingException
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.util.*
import java.util.stream.Collectors
import kotlin.collections.ArrayList
import kotlin.collections.HashMap
import kotlin.collections.List
import kotlin.collections.Map
import kotlin.collections.MutableList
import kotlin.collections.MutableMap
import kotlin.collections.isNotEmpty
import kotlin.collections.set

//import org.springframework.data.document.mongodb.query.Query;
//import org.springframework.data.mongodb.core.query.Query
//import org.springframework.data.mongodb.core.validation.Validator.document

@Service
class Service {
    @Autowired
    var mongoTemplate: MongoTemplate? = null

    @Autowired
    private val kafkaTemplate: KafkaTemplate<String, String>? = null
    var dao: Dao? = null


    fun findUniqueCategory(): List<Document>? {
        dao = mongoTemplate?.let { Dao(it) }
        val fields = Document()
        fields["category"] = 1
        fields["product"] = 1
        fields["info"] = 1
        fields["image"] = 1
        return dao?.findFields("formConfig", fields)

    }

    fun deleteFormConfig(category: String, product: String): String {
        dao = mongoTemplate?.let { Dao(it) }
        val query = Document()
        query["category"] = category
        query["product"] = product
        dao?.delete("formConfig", query)
        dao?.delete("partners", query)
        return "successfull"
    }

    fun findUserLocation(): ArrayList<Document> {
        dao = mongoTemplate?.let { Dao(it) }
        var paidQuery="{\n" +
                "        aggregate: \"payment\",\n" +
                "        pipeline: [\n" +
                "\n" +
                "            {\n" +
                "                \"\$match\": {\n" +
                "                    \"userLocation.userAllowed\": true,\n" +
                "                    \"result.status\": \"succeeded\"\n" +
                "                }\n" +
                "            },\n" +
                "            {\n" +
                "                \"\$project\": {\n" +
                "                    \"product\": 1,\n" +
                "                    \"userLocation\": 1,\n" +
                "                    \"_id\": 0,\n" +
                "                    \"ViewTime\": \"\$time\",\n" +
                "                    \"category\": 1\n" +
                "                }\n" +
                "            },\n" +
                "            {\n" +
                "                \"\$addFields\": {\n" +
                "                    \"userBought\": true\n" +
                "                }\n" +
                "            }\n" +
                "        ],\n" +
                "        cursor: {}\n" +
                "    }"
        var paidMembers=mongoTemplate?.executeCommand(paidQuery) as Document
        var paidData= JSONObject(paidMembers.toJson()).getJSONObject("cursor").getJSONArray("firstBatch")
        var nonPaidQuery="{\n" +
                "    aggregate: \"quotes\",\n" +
                "    pipeline: [\n" +
                "        {\n" +
                "            \"\$lookup\": {\n" +
                "                \"from\": \"payment\",\n" +
                "                \"localField\": \"category\",\n" +
                "                \"foreignField\": \"category\",\n" +
                "                \"as\": \"category\"\n" +
                "            }\n" +
                "            ,\n" +
                "\n" +
                "            \"\$lookup\": {\n" +
                "                \"from\": \"payment\",\n" +
                "                \"localField\": \"product\",\n" +
                "                \"foreignField\": \"product\",\n" +
                "                \"as\": \"product\"\n" +
                "            }\n" +
                "            ,\n" +
                "            \"\$lookup\": {\n" +
                "                \"localField\": \"formData.email\",\n" +
                "                \"as\": \"email\",\n" +
                "                \"foreignField\": \"email\",\n" +
                "                \"from\": \"payment\"\n" +
                "            }\n" +
                "        },\n" +
                "        {\n" +
                "            \"\$match\": {\n" +
                "                \"email\": {\n" +
                "                    \"\$eq\": [],\n" +
                "                    \"\$exists\": true\n" +
                "                }, \"userLocation.userAllowed\": true\n" +
                "            }\n" +
                "        },\n" +
                "        {\n" +
                "            \"\$project\": {\n" +
                "                \"product\": 1,\n" +
                "                \"userLocation\": 1,\n" +
                "                \"_id\": 0,\n" +
                "                \"ViewTime\": \"\$time\",\n" +
                "                \"category\": 1\n" +
                "            }\n" +
                "        },\n" +
                "        {\n" +
                "            \"\$addFields\": {\n" +
                "                \"userBought\": false\n" +
                "            }\n" +
                "        }\n" +
                "    ],\n" +
                "    cursor: {}\n" +
                "}"
        var nonPaidMembers=mongoTemplate?.executeCommand(nonPaidQuery) as Document
        var nonPaidData= JSONObject(nonPaidMembers.toJson()).getJSONObject("cursor").getJSONArray("firstBatch")
        var output=ArrayList<Document>()
        for(i in 0 until paidData.length()){
            output.add(Document.parse(paidData[i].toString()))
        }
        for(i in 0 until nonPaidData.length()){
            output.add(Document.parse(nonPaidData[i].toString()))
        }
        return output
    }

    fun partnerPaymentCount(): MutableList<Document> {
        dao = mongoTemplate?.let { Dao(it) }
        var list: MutableList<Bson> = ArrayList<Bson>()
        val multiIdMap: MutableMap<String, Any> = HashMap()
        multiIdMap["partner"] = "\$partner"
        multiIdMap["category"] = "\$category"

        val groupFields = Document(multiIdMap)
        list.add(Aggregates.group(groupFields, Accumulators.sum("count", 1)))
        var project = Document()
        project["_id"] = 0
        project["category"] = "\$_id.category"
        project["partner"] = "\$_id.partner"
        project["count"] = 1
        list.add(Aggregates.project(project))
        var result = JSONArray()
        var dbOutput = dao?.aggregate("payment", list)
        if (dbOutput != null) {
            for (output in dbOutput) {
                print(output)
                var jsonOutput = JSONObject(output.toJson())
                var flag = true
                for (i in 0 until result.length()) {
                    if (jsonOutput.getString("category") == result.getJSONObject(i).getString("category")) {
                        jsonOutput.remove("category")
                        var res1 = result.getJSONObject(i)
                        var res = result.getJSONObject(i).getJSONArray("partners").put(jsonOutput)
                        res1.put("partners", res)
                        result.put(i, res1)
                        flag = false
                    }
                    if (!flag) {
                        break
                    }

                }
                if (flag) {
                    var res = JSONObject()
                    res.put("category", jsonOutput.getString("category"))
                    jsonOutput.remove("category")
                    res.put("partners", JSONArray().put(jsonOutput))
                    result.put(res)
                }
            }
        }
        var resultFormat: MutableList<Document> = ArrayList<Document>()
        for (i in 0 until result.length()) {
            resultFormat.add(Document.parse(result.getJSONObject(i).toString()))
        }
        return resultFormat

    }

    fun addPartner(data: String) {
        dao = mongoTemplate?.let { Dao(it) }
        var jsonData = JSONObject(data)
        val query = Document()
        query["category"] = jsonData.getString("category")
        query["product"] = jsonData.getString("product")
        query["partner"] = jsonData.getString("partner")
        var partners = dao?.find("partners", query)
        var flag = true
        if (partners != null) {
            if (partners.isNotEmpty()) {
                flag = false
                var dat = partners[0]
                jsonData.put("_id", dat["_id"])
                partners?.get(0)?.let { dao?.delete("partners", it) }
            }

        }
        if (flag) {
            kafkaTemplate?.send("pipe", "partner,$jsonData")
        }
        dao?.insert("partners", Document.parse(jsonData.toString()))
    }

    fun findFormConfig(category: String, product: String): List<Document>? {
        dao = mongoTemplate?.let { Dao(it) }
        val query = Document()
        query["category"] = category
        query["product"] = product
        return dao?.find("formConfig", query)

    }

    @Throws(UnsupportedEncodingException::class)
    private fun encodeValue(value: String?): String {
        return URLEncoder.encode(value, StandardCharsets.UTF_8.toString())
    }

    fun apiRequests(data: String): List<Document> {
        println(data)
        dao = mongoTemplate?.let { Dao(it) }
        val jsonData = JSONObject(data)
        val query = Document()
        query["category"] = jsonData.getString("category")
        query["product"] = jsonData.getString("product")
        var dbQuotes = JSONArray()
        //val quotes= JSONArray()
        var quotes: MutableList<Document> = ArrayList<Document>()

        val partners = dao?.find("partners", query)
        if (partners != null) {
            for (partner in partners) {
                val curPartner = JSONObject(partner.toJson())
                var request: Request.Builder?
                val inputData = mapFields(jsonData.getJSONObject("formData"), curPartner.getJSONArray("inputField"))
                request = if (curPartner.getJSONObject("api").getString("method").equals("GET")) {

                    getOkHttp(inputData, curPartner)

                } else {

                    postOkHttp(inputData, curPartner)
                }

                val headers = curPartner.getJSONObject("api").getJSONArray("headers")
                for (i in 0 until headers.length()) {
                    val header = headers.getJSONObject(i)
                    if (header.getString("header") != "" && header.getString("value") != "") {
                        if (request != null) {
                            request = request.addHeader(header.getString("header"), header.getString("value"))
                        }
                    }
                }
                val client = OkHttpClient()
                val call = request?.let { client.newCall(it.build()) }
                val response = call?.execute()
                val resData = response?.body()!!.string()
                var res = mapOFields(JSONObject(resData), curPartner.getJSONArray("outputField"))
                println(curPartner.getString("partner"))
                var quote = JSONObject()
                quote.put("partner", curPartner.getString("partner"))
                quote.put("image", curPartner.getString("image"))
                quote.put("quote", res)
                println(quote.toString())
                dbQuotes.put(quote)

                quotes.add(Document.parse(quote.toString()))
            }

        }
        jsonData.put("quotes", dbQuotes)
        jsonData.put("time", Date())
        kafkaTemplate?.send("pipe", "quote,$jsonData")
        dao?.insert("quotes", Document.parse(jsonData.toString()))
        return quotes
    }

    fun categoryPartnersCount(): List<Document>? {
        dao = mongoTemplate?.let { Dao(it) }
        var list: MutableList<Bson> = ArrayList<Bson>()

        list.add(Aggregates.group("\$category", Accumulators.sum("partnerCount", 1)))
        var project = Document()
        project["_id"] = 0
        project["category"] = "\$_id"
        project["partnerCount"] = 1
        list.add(Aggregates.project(project))
        return dao?.aggregate("partners", list)
        //return Document.parse(output.toString())
    }

    fun partnerCategoryCount(): List<Document>? {
        dao = mongoTemplate?.let { Dao(it) }
        var list: MutableList<Bson> = ArrayList<Bson>()
        list.add(Aggregates.group("\$partner", Accumulators.sum("count", 1)))
        var project = Document()
        project["_id"] = 0
        project["partner"] = "\$_id"
        project["count"] = 1
        list.add(Aggregates.project(project))
        return dao?.aggregate("partners", list)
        //return Document.parse(output.toString())
    }

    fun categoryRequests(): List<Document>? {
        dao = mongoTemplate?.let { Dao(it) }
        var list: MutableList<Bson> = ArrayList<Bson>()
        list.add(Aggregates.group("\$category", Accumulators.sum("count", 1)))
        var project = Document()
        project["_id"] = 0
        project["category"] = "\$_id"
        project["count"] = 1
        list.add(Aggregates.project(project))
        return dao?.aggregate("quotes", list)
        //return Document.parse(output.toString())
    }

    fun mapOFields(data: JSONObject, map: JSONArray): JSONObject {

        val output = JSONObject()
        for (i in 0 until map.length()) {
            if (data.has(map.getJSONObject(i).getString("from"))) {
                if (!output.has(map.getJSONObject(i).getString("to"))) {
                    output.put(map.getJSONObject(i).getString("to"), data.getString(map.getJSONObject(i).getString("from")))
                } else {
                    output.put(map.getJSONObject(i).getString("to"), output.getString(map.getJSONObject(i).getString("to")) + "\n" + data.getString(map.getJSONObject(i).getString("from")))
                }
            } else {
                output.put(map.getJSONObject(i).getString("to"), "")
            }
        }
        return output
    }

    fun mapFields(data: JSONObject, map: JSONArray): JSONObject {
        val output = JSONObject()
        for (i in 0 until map.length()) {
            if (data.has(map.getJSONObject(i).getString("from"))) {
                output.put(map.getJSONObject(i).getString("to"), data.getString(map.getJSONObject(i).getString("from")))
            } else {
                output.put(map.getJSONObject(i).getString("to"), "")
            }
        }
        return output
    }

    fun getOkHttp(data: JSONObject, partner: JSONObject): Request.Builder? {
        var request = Request.Builder().url(partner.getJSONObject("api").getString("path"))
        val map: HashMap<String, String>
        val mapper = ObjectMapper()
        map = mapper.readValue(data.toString(), object : TypeReference<Map<String, String>>() {}) as HashMap<String, String>
        var combine = "="
        var combine1 = "&"
        var combine2 = "?"
        if (partner.getJSONObject("api").getString("uriType") == "/") {
            combine = "/"
            combine1 = "/"
            combine2 = ""
        }
        val finalCombine = combine
        val encodedURL = map.keys.stream()
                .map { key: String ->
                    try {
                        return@map key + finalCombine + encodeValue(map[key])
                    } catch (e: UnsupportedEncodingException) {
                        e.printStackTrace()
                    }
                    ""
                }
                .collect(Collectors.joining(combine1, partner.getJSONObject("api")["path"].toString() + combine2, ""))
        print("URL")
        println(encodedURL)
        request = Request.Builder().url(encodedURL)
        request = request.get()
        return request

    }

    fun postOkHttp(data: JSONObject, partner: JSONObject): Request.Builder {
        var request = Request.Builder().url(partner.getJSONObject("api").getString("path"))
        val body = okhttp3.RequestBody.create(MediaType.get("application/json; charset=utf-8"), data.toString())
        request = request.post(body)
        return request
    }
}