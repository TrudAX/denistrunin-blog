---
title: "Monitoring integration in D365FO"
date: "2022-08-11T22:12:03.284Z"
tags: ["XppDEVTutorial", "Integration"]
path: "/xpptools-integworkspace"
featuredImage: "./logo.png"
excerpt: "The blog post describes a sample approach to implement recurring file-based integration in D365FO using X++ and DMF"
---

Integration often plays a key role into project implementation and monitoring it is a key part of ongoing project work, sys admins need to be able quicky view the integration status and get general statistics about each integration

In this post I describe the key parameters for External integration module and how they are calculated.

External integration is a module to process inbound(import) and outbound(export) messages from D365FO. The key part of the module is to provide a framework to develop integrations that allows to be quicky troubleshoot and monitored. 

Microsoft provides a great form types in D365FO that called workspaces and that may contains all key statistics for the module. Let's analyse them   

## Error monitoring

First the summary error section, ideally this section should contains only 0 values 

Number of import errors - this counter contains the number of records in the Incoming messages table that have Error status. This will require immediate attention from the admin, processing errors may happen for the different reasons. Incoming messages form provide a detail views with the error text. There can be 2 possible outcome of error resolution:

Reprocess - for example you process messages and the error code(Cost code AAA doesn't exists). You can create this Cost code and process this message

Cancel - the same situation but after checking you just understand that this CostCode should not be even send to D365FO. In this case you just Cancel the message

Number of not processed imports - the counter calculates the messages that stuck in Ready and In processing status. Any import constists of 2 stages: load the message to D365FO(that involves communicatoin to External resources) and process this message. If the message is loaded but not processes this may indicate that the processing batch job is not running or failed for some reason 

Export errors(last 24h) - export errors are not planned errors. The typical error may be that the system can't connect to a resource to upload an export file. For this type of errors we only need the latest status, if a week ago something happesn and now it is fine, it doesn't require attention

Total sections 

that is just a general statistics for a last 24h. Number of incoming messages, number of exports and event exports

Details 

Detail statistics provides more insigns to the partucular integration. Use may specfy a date filter that may be the following value 

Last hour

Last day

Last week

Custom interval

let's describe what values are displayed and why they may be usefull

Inbound details statistics

For each message type we calculate the following values for a specified date period 

- Number of messages - this allows us to see, how active was the particular integration
- Last import - the date where the last import was performed. if you see something is the past here, that means integration may not even working(e.g. batch job not running for some reason)
- Number of lines - every document may contain several lines, used to determing integratoin volume
- Duration(m) - time in minutes used for messages processing. allows to define most 'heavy' integrations and  optimize them

Ounbound details statistics

for every message type the following information provided

- Number of export - how often the integration is running
- Last export - the time when the last export was performed, someting in the past means the export is not runnining
- Number the exported line - how many lines were exported during the time interval
- Warnings - export messages allow to mark Export with a warning, for example you export Items and some Items doesn't have price agreement. You don't break the export, but mark this message with a warinig status, that may require admin attention
- Errors - Number of export errors. That means that the system contains some invalid data that you don't want even to export or export job can't connect to the export destination
- Time used to perform the export. This allows to identify most complex exports

Outbound(events) statistics

This allow to identify parametes to even based exports 

- Number of exports - number of time the export was performed 
- Number of lines - number of documents that were exported. For example you have an integaration that exports vendor changes. one vendor can be modified sevetal times(e.g. 3 times), in this case lines will contain 1, and the number of exports will be 3. For documents that are not changing(like customer invoices) number of lines and number of exports will be the same 
- Last export - the time when the last export was done, some past value means the export job is not running 
- To export - number of documents that are waining for the export to run
- To send date - minumun date from the lines that are waining to be exported





## Summary

In this post I provided a sample implementation for a File-based integration 

I uploaded files used for this post to the following [folder](https://github.com/TrudAX/XppTools#devtutorialintegration-submodel)

I hope you find this information useful. As always, if you see any improvements, suggestions or have some questions about this work don't hesitate to contact me.
