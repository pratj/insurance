import { Button, Grid } from '@material-ui/core'
import React, {useState} from 'react'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { makeStyles} from '@material-ui/core/styles';
import { useHistory } from "react-router";
import StripeCheckout from 'react-stripe-checkout';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Geocode from "react-geocode";
//import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import SuccessfulPayment from './Suggestion'

import axios from 'axios'
import './RenderQuote.css'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const useStyles = makeStyles(() => ({
    root: {
      display: 'flex',
    },
        
  }));
  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

function RenderQuote({locationData}) {

    const [open, setOpen] = React.useState(false);
    const [openDialog, setOpenDialog] = React.useState(false);
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setOpen(false);
      };
      const handleCloseDialog = () => {
       
    
        setOpenDialog(false);
      };
      const history = useHistory();
      function handleMore(){
        history.push("/")
      }
    const classes = useStyles();
    const quoteResponse = JSON.parse(locationData.location.state.quoteData)
    console.log("QUOTE RESPONSE>>>",quoteResponse)
    const quoteData = quoteResponse.quoteData
    var paymentPartner, paymentProduct, paymentCategory, amountPayed
    
    console.log("QUOTE DATA IN RENDERQ",quoteData)

    const Capitalize = (str)=>{
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    async function handleToken (token, addresses) {
        //Have to send the product also to the backend {token, product}
        console.log({token:token, address: addresses, partner: paymentPartner, product:paymentProduct, category: paymentCategory, amount: amountPayed, userLocation: quoteResponse.userLocation})
        //const [data]=React.useState({address: addresses, partner: paymentPartner, product:paymentProduct, category: paymentCategory, amount: amountPayed, userLocation: quoteResponse.userLocation})
        const data={ token:token, address: addresses, partner: paymentPartner, product:paymentProduct, category: paymentCategory, amount: amountPayed, userLocation: quoteResponse.userLocation}
        
         const response=  await axios.post("http://localhost:9090/api/charge", {data}  )
        // .then(response=>{
        //     console.log("RESPONSE", response.data);

        // }).catch(err=>{
        //     console.log("ERROR", err);
        // })
         
        const { status } = response.data;
    console.log("Response:", response.data);
    if (status === "succeeded") {
        setOpen(true)
        setOpenDialog(true)
      console.log("Success! Check email for details");
      //history.push('/quote/success')
    } else {
      console.log("Something went wrong");
      // history.push('/quote/error')
    }
        

    }
    
    const handlePaymentData=(partner,product,category, premium)=>{
        paymentPartner=partner
        paymentProduct=product
        paymentCategory=category
        amountPayed=premium
    }
    const stripePayment = (partner, premium) => {
        console.log("PREMIUM>>>",premium)
        
        return <StripeCheckout
            stripeKey={process.env.REACT_APP_STRIPE_KEY}
            currency="INR"
            //image="logo.png"
            description={`${quoteResponse.product} By ${partner}`}
            token={handleToken}
            amount={premium*100}            
            name="InsuranceBzr"
            billingAddress
            shippingAddress>
                <Button className="stripebutton" onClick={()=>handlePaymentData(partner,quoteResponse.product,quoteResponse.category, premium)} style={{height:'20%', display:'flex', alignContent:'center', margin: 'auto', marginLeft: '65px', marginTop: '65px', borderRadius: '15px', backgroundColor: 'orange'}}  >Buy Now</Button>
            </StripeCheckout>
            
    }
    const renderQuote = (quote) => {
        let quotes=[]
        for(let key in quote){
            if(quote[key] !== ""){
                quotes.push(<Typography variant="body2" color="textSecondary" component="p">{Capitalize(key)}: {quote[key]}</Typography>)
            }
            

            
        }
        return quotes
    }

    const renderPartner = (partner, index) => {
        return (
            <Grid item xs={12} sm={12}>
                <Card className="card" key={index} style={{maxWidth: 700, margin: 'auto', marginTop: 20}} className={classes.root}>    
                    <CardMedia image={partner.image} style={{width: 250}}/>
                    <div className={classes.details}>
                    <CardContent className={classes.content}>
                        <Typography gutterBottom variant="h5" component="h2">
                            {partner.partner}
                        </Typography>
                        <Divider/>
                        <br></br>
                        {(typeof (partner.quote) === 'object') && <>{renderQuote(partner.quote)}</>}
                        

                         {/* {renderQuote(partner)} */}
                    </CardContent>
                    </div>
                    {stripePayment(partner.partner, partner.quote.premium)}
                    {/* <Button style={{height:'50%', margin: 'auto', marginTop: '65px', borderRadius: '15px', backgroundColor: 'orange'}}  onClick={() => stripePayment(partner.partner, partner.premium)}>Buy Now</Button> */}
                </Card>
            </Grid>
        )

    }
    

    return (
        <div>
            <Grid container>
                {quoteData.map(renderPartner)}
            </Grid>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
        Success! Check email for details
        </Alert>
      </Snackbar>
      <div>
      
      <Dialog
        open={openDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle style={{textAlign:"center"}}id="alert-dialog-slide-title">{"Your Payment of was successful"}</DialogTitle>
        <DialogContent>
        
        <img style={{marginLeft:"12%"}}src="https://i.pinimg.com/originals/0d/e4/1a/0de41a3c5953fba1755ebd416ec109dd.gif"/>
          <DialogContentText id="alert-dialog-slide-description">
            Receipt has been sent to your email address. Thank you for choosing us!
            
          </DialogContentText>
        </DialogContent>
        
        <DialogActions>
        <Button onClick={handleMore} color="primary">
        Check out more Insurances
          </Button>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>

        </div>
    )
}

export default RenderQuote
