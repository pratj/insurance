import React from 'react'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
//import DateFnsUtils from "@date-io/date-fns";
import { Button, Container, TextField, Typography } from '@material-ui/core';
export default function DatePicker(props) {

    const { name, label, value, onChange } = props
    
    const type="date"
    // const convertToDefEventPara = (name, value) => ({
    //     target: {
    //         name, value
    //     }
    // })

    return (
        // <MuiPickersUtilsProvider >
        <TextField id={name} name={name} type={type} label={label}  
        variant="outlined" margin="normal" required fullWidth style={{}}/>
        //{/* </MuiPickersUtilsProvider> */}
    )
}