import React, {useEffect, useState} from 'react'
import RenderForm from './RenderForm';
import axios from 'axios'
import { useHistory } from "react-router";

import ClipLoader from "react-spinners/ClipLoader";
import { CircularProgress } from '@material-ui/core';
import useGeoLocation from '../geolocation/useGeoLocation'
import Backdrop from '@material-ui/core/Backdrop';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }));



function Form({cardInfo, setOpenPopup}) {
    const classes = useStyles();
     const [loading, setLoading] = useState(false);
    const [formFields, setFormFields] = useState()
    const history = useHistory();
    const geoLocation= useGeoLocation();

    const onSubmit = (data) => {
         setLoading(true)
         handleToggle()
         

            const userLocation= geoLocation.loaded ? (geoLocation): "Location data not available yet."
            
            console.log(userLocation)
          
        
        

        const finalData = {category: cardInfo.category, product: cardInfo.product, formData: data, userLocation:userLocation}
        console.log("Final Data to be sent => ", finalData)
        axios.post("http://localhost:9090/api/response", finalData).then((response) => {
            const quoteData={category: cardInfo.category,product: cardInfo.product, quoteData: response.data, userLocation:userLocation} 
            
            //console.log("Quote => ", response.data)
            redirectToPath(quoteData)
            //history.push()
        })
       
        setOpenPopup(false)
        // setLoading(false)
    }
    function redirectToPath(quoteData) {
        setLoading(true);
        history.push("/quote", {quoteData: JSON.stringify(quoteData)})
        handleToggle()
        }
        

    useEffect(() => {
        axios.get(`http://localhost:9090/api/config/category/${cardInfo.category}/product/${cardInfo.product}`).then((response) => {
            console.log(response.data)
            setFormFields(response.data[0].fields)
        })
        
    }, [])
    const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
    console.log("BACKDROP",open)
    return(
        <Backdrop  open={open} onClick={handleClose}>
        <CircularProgress className={classes.backdrop} color="inherit" />
      </Backdrop>
    )
  };

    return (
        <div>
            
             {/* css={override} */}

            {typeof formFields !== 'undefined' && 
                <RenderForm formFields={formFields} onSubmit={onSubmit}/>
            }
            
            
        </div>
    )
    
}

export default Form
