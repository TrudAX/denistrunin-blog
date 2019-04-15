---
title: "Designing D365FO Integration solution"
date: "2019-03-06T22:12:03.284Z"
tags: ["TRUDScripts"]
path: "/integration-checklist"
featuredImage: "./logo.png"
excerpt: "Document contains main points to consider when designing integration solutions"
---

There are a lot of ways to implement integration with D365FO for external system. To choose the correct approach very important to clearly understand integration requirements before doing actual programming/setup. In this document I propose the actual checklist of what you need to know before designing integration implementation. Checklist is based on Oracle guidelines  

Every question in this document have a value and can dramatically change actual integration implementation

> # Integration solution specification
>
> Adapted version for D365FO/AX2012
>
> ## Defining the Integration Solution Topology
>
> Integration topology specifies the physical location of the various entities in the integration environment. This topology should include information about the types of network connections among the participants, including LAN, WAN, Internet, dial-up, and so on.
>  The integration specialist must ask whether all the constituent entities in an integration solution will be located:
>
> - At a single physical site (a LAN with a single domain)? 
> - At different sites that are connected via a WAN behind a firewall? 
> - At different sites for various trading partners, separated by firewalls?
>
> ## Defining Business Data Flows
>
> Defining Data Flow Requirements
>
> - Sequence or order (in relation to other tasks and activities)
> - Conditional data—data that is required to make processing decisions. (for example – file is created with the special extension in integration shared folder)
> - Business or application rules—processing rules that are applied to the conditional data to determine the run-time execution path of the process. 
> - Mappings—data transformations between the business events used as input and those used as output. For example, file moved to Processed folder after the import or some status file updated
> - Business transactions—transactional boundaries in the process. A single process might contain many business transactions. In addition, for each business transaction, the integration specialist needs to define any compensating actions that must be performed if a transaction needs to be rolled back. 
> - Error handling—what exceptions can occur and how they should be handled.
> - Duplicate data handling—how system should react to already processed data(for example file with the same name)
>
> ## Analysing the Data Flow properties
>
> - What are the characteristics of each data element? 
> - What are the characteristics of messages? 
>   -Message size, specified in terms of minimum, maximum, and average size 
>   -Message volume, specified in the number of messages at peak, lull, and average volumes, plus any cyclical patterns 
>   -Single or batched (aggregated) message. If messages are aggregated, do they need to be split up and routed appropriately? If so, what are the routing criteria or conditions? 
> - What data transformations are needed between the source data and target data?
>
> ## Defining the Quality of Service
>
> ### Performance
>
> - How quickly, in business terms, must the business process be carried out? 
> - What are peak and off-peak performance requirements? 
>
> ### Availability and Reliability
>
> - When must systems be available? Are they needed 24 hours a day, 7 days a week (24x7)? 
> - What are the planned and anticipated periods of scheduled and unscheduled system downtime, respectively? 
> - What is the maximum allowable downtime? 
> - What failover and recovery protections are required in case a hardware or network failure occurs? 
> - Do business messages need to be persisted while in transit and recovered upon a system restart? 
>
> ### Security
>
> - How sensitive is the information in the business process? 
> - What are the privacy needs associated with each role? 
> - What security safeguards are currently in place? 
>
> ### Scalability
>
> Define the scalability requirements for the business process, based on the current volume of work and the projected volume in the future. (for example, the volume of orders it can handle, without interruption to service or additional application development by using more advanced hardware).
>
> ### Logging and Nonrepudiation
>
> - What kinds of problems can arise? 
> - What information needs to be logged and monitored? 
> - For integration solutions that use B2B integration, what information needs to be logged and maintained for audit or nonrepudiation purposes?



## Practical examples

Here I try to describe most problematic moments that was caused by the fact that integration requirements were not properly described during the design phase and this caused implementation problems

### Performance

You need clearly define and test the amount of data that needs to be processed and time interval when processing should be done. Problems can be caused even by the simple solutions. For example client can ask you to develop a webservice that returns a list of vendors. This can be easily developed and tested but on production system you may see hundreds per minute calls of this webservice that can completely stops the whole system.

### Transaction support

When working with multiline documents transaction support is required. For example you import 10 lines sales order from external system and 1 sales line can't be created due to some validation. In most cases you don't want to create sales order with 9 lines, the whole document should be rejected and often this behaviour implemented via SQL transaction support. Such requirement can limit the number of solutions as for example standard D365FO Data managements module doesn't support transactions, you can't write several records in transactions

![](EntityWrite.png)   

In this case you either need to implement you own transaction system(via additional flags) or write more code that was initially planned

### Logging and traceability

Logging and traceability should be implemented as base requirement. For export scenarios it should be easy to identify what and when this particular record was exported, for import scenarios - what was the original request, it's processing status and what documents were created as the result of this processing.

### Errors handling

Errors often divided by 2 categories - that can and that can' be resolved by subsequent executions. For example when you are reading data from the file and the file structure is not what you expect to see - you can just mark this file with error flag and move it to the Errors folder. If the file contains vendor code that doesn't exists in the system probably you can just show an error and then try to process this file again(the vendor may be created later). You should also think if there will not be any reaction from the system administrator to the errors. Constant growing numbers of old error can stop new messages from processing, so some logic to mark such messages as skipped after some time(or number of process attempts) should be implemented.   

### Async and sync 

From my experience better try to avoid synchronous calls, especially when you don't control external system. It's is not always possible, but if you can do this, better to implement some middleware storage where you can read/write messages.

### Reproduction and testing support    

This is a key factor to successful implementation. It should be easy to reproduce/test single message processing. If you integration works with physical devices, you should think about device emulator, if you are processing files from the specified folder(or processing data from the messages table) your solution should allow select individual file/message to process. This allows quickly debug, test and solve potentials problems.

## Summary

If you know some other methods that can be added into this class feel free to create a GitHub pull request or leave a comment.
