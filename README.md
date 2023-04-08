# ema_website_scrapper

A websraper service that inputs the export and tariff data from the EMA site into firestore DB and notifies via telegram  app on any price changes.This function is deployed 
as a serverless lambda function.

 AWS Eventbridge can be used to schedule when to execute this function.
