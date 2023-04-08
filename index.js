
const moment = require('moment');
const tabletojson = require('tabletojson').Tabletojson;
const _ = require('lodash');
const cheerio =  require('cheerio');
const axios = require('axios');
const { db } = require('./utils/firestore')

const { TelegramClient } = require('messaging-api-telegram')
const usep_bot= TelegramClient.connect('');



const USEP_CHAT_ID=""



module.exports.export_price= (event,context,callback)=>{

    
    
    
    var export_price_setting=1000


var ref=db.collection("energy_price").doc("export_price").collection("date")

tabletojson.convertUrl(
'https://www.emcsg.com/marketdata/priceinformation',
{useFirstRowForHeadings:false,
stripHtmlFromHeadings:true },
async function(tablesAsJson) {
  console.log(Object.keys(tablesAsJson[0][0]))

var field_array=Object.keys(tablesAsJson[0][0])

for(var field=0;field<field_array.length;field++)
{

  if(tablesAsJson[0][0][field_array[field]]=="Date") //0
  {
    var date_key=field

  }

  if(tablesAsJson[0][0][field_array[field]]=="Period")  //1
  {var period_key=field}

  if(tablesAsJson[0][0][field_array[field]]=="USEP($/MWh)")  //4
  {var usep_key=field}


}




var main_array=tablesAsJson[3]
console.log(main_array)

main_array.forEach(jsonObject => {

  var checkDoc=ref.doc(moment.utc(new Date(jsonObject[date_key])).utcOffset("+08:00").format("DD-MM-YYYY"))

  //can just use moment(jsonObject[date_key]).format("DD-MM-YYYY")

  checkDoc.get().then(async doc=>{
      if (!doc.exists) {
        ref.doc(moment.utc(new Date(jsonObject[date_key])).utcOffset("+08:00").format("DD-MM-YYYY")).set({"timestamp":new Date(jsonObject[date_key])})

        ref.doc(moment.utc(new Date(jsonObject[date_key])).utcOffset("+08:00").format("DD-MM-YYYY")).collection("time_period").doc(jsonObject[period_key]).set({
        "usep_price":parseFloat(jsonObject[usep_key]),
        "timestamp":new Date(),
        "units":"$/MWH"
      
      
        })
       if(jsonObject[usep_key]>export_price_setting){
        console.log(jsonObject[usep_key])
        console.log(jsonObject[period_key]) 
      
        console.log((jsonObject[date_key]))
        var message="Price Alert\nDate:"+(jsonObject[date_key])+"\nTime Period:"+jsonObject[period_key]+"\nUSEP Price:"+jsonObject[usep_key]
        await usep_bot.sendMessage(USEP_CHAT_ID,message)
        console.log("message sent")
       //console.log(message)
      
      }
      } else {
        

        ref.doc(moment.utc(new Date(jsonObject[date_key])).utcOffset("+08:00").format("DD-MM-YYYY")).set({"timestamp":new Date(jsonObject[date_key])})
        ref.doc(moment.utc(new Date(jsonObject[date_key])).utcOffset("+08:00").format("DD-MM-YYYY")).collection("time_period").doc(jsonObject[period_key]).get().then(async timeDoc=>{


          if(!timeDoc.exists)
          {
              ref.doc(moment.utc(new Date(jsonObject[date_key])).utcOffset("+08:00").format("DD-MM-YYYY")).collection("time_period").doc(jsonObject[period_key]).set({
                  "usep_price":parseFloat(jsonObject[usep_key]),
                  "timestamp":new Date(),
                  "units":"$/MWH"
                
                
                  })
                 if(jsonObject[usep_key]>export_price_setting){
                  console.log(jsonObject[usep_key])
                  console.log(jsonObject[period_key]) 
                
                  console.log((jsonObject[date_key]))
                  var message="Price Alert\nDate:"+(jsonObject[date_key])+"\nTime Period:"+jsonObject[period_key]+"\nUSEP Price:"+jsonObject[usep_key]
                  await usep_bot.sendMessage(USEP_CHAT_ID,message)
                  console.log("message sent")
                 //console.log(message)
                
                }

          }
             else{
                 //check if incoming data is different from old data for cases where old data is >1000 or new data >1000
          var old_usep_price=timeDoc.data().usep_price
          //rectify all changes first
          if(parseFloat(jsonObject[usep_key])!=old_usep_price){
              ref.doc(moment.utc(new Date(jsonObject[date_key])).utcOffset("+08:00").format("DD-MM-YYYY")).collection("time_period").doc(jsonObject[period_key]).set({
                  "usep_price":parseFloat(jsonObject[usep_key]),
                  "timestamp":new Date(),
                  "units":"$/MWH"
                
                
                  })

          }
          if(old_usep_price>1000){
          if(parseFloat(jsonObject[usep_key])!=old_usep_price)
          { 
            
              var new_message="Price Change Alert \nDate:"+(jsonObject[date_key])+"\nTime Period:"+jsonObject[period_key]+"\nNew USEP Price:"+jsonObject[usep_key]
              await usep_bot.sendMessage(USEP_CHAT_ID,new_message)
              console.log("message sent to notify change")
              //console.log(new_message)


          }}

          else if((old_usep_price<1000)&&(parseFloat(jsonObject[usep_key])>1000))
          {    
              console.log("increase change detected")
           
              var new_message="Price Change Alert \nDate:"+(jsonObject[date_key])+"\nTime Period:"+jsonObject[period_key]+"\nNew USEP Price:"+jsonObject[usep_key]
              await usep_bot.sendMessage(USEP_CHAT_ID,new_message)
              console.log("message sent to notify change")
              //console.log(new_message)


          }
      
      }
        })


        
      
      }



    })



  
})


      console.log("done")

})









  }

  module.exports.sp_tariff=(event,callback)=>{

    
    

      var ref=db.collection("energy_price").doc("sp_tariff").collection("time_period").doc()
      var url='https://www.ema.gov.sg/Residential_Electricity_Tariffs.aspx'

      axios.get(url).then(response=>{

        var $ = cheerio.load(response.data)
        var w=$('.tarrif-rates').text()
        var tariff_value=(w.replace(/\s+/g, '')).replace('centsperkWh','')

        ref.set({
          tariff:parseFloat(tariff_value),
          timestamp:new Date()
        })



      }).catch(error=>{

        console.log(error)
      })







    


  }
