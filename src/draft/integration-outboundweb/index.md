---
title: "Implement Event-based Data Export from D365FO to Web service"
date: "2024-09-12T22:12:03.284Z"
tags: ["Integration", "XppDEVTutorial"]
path: "/integration-outboundweb"
featuredImage: "./logo.png"
excerpt: "This blog post describes how to implement integration with an external Web service by sending data from D365FO based on events"
---

**External integration** is a [framework](https://github.com/TrudAX/XppTools?tab=readme-ov-file#devexternalintegration-submodel) designed for inbound and outbound integrations in D365FO. It supports several channels: Azure file share, SFTP, Azure service bus, and provides comprehensive features for logging, error handling, and troubleshooting.

In this blog post, I will describe how to implement event-based data export to the external web service. I will show it on a a simplified example but the approach is based on real-life integrations , and provided implementation contains common elements that contains some reusable code for similar tasks.  

## Task description

Let's start with our task definition:

**We want to send confirmed purchase orders from D365FO to our partner website via the Rest API endpoint.**

To create a demo for this post, I asked Claude Sonnet 3.5 to generate a simple Purchase Order Management application and deploy it to Azure.

The source code is on [GtHub](https://github.com/TrudAX/TestWebService_PurchaseOrderApp), and the application consists of a frontend displaying orders.

![Purch management App](PurchManagementAppScreen.png)

And the backend that contains API for accepting these orders.

![API sample](ApiPicture.png)

UML diagram for our test process is the following 

![UML Diagram](UMLDiagram.png)

## How to manage such integration task

To start doing tasks like this I suggest an initial meeting with business users from D365FO and WebService site(3-party team) where we discuss the following questions:

#### Discuss and create a mapping document

What data do we want to send, and how to map these data to what 3-party can accept? This is a main question for the whole integration and it often consumes quite a lot of time.

A template for such document  can be found here.

In our example, we want to send all confirmed purchase orders for vendors from the specified Vendor group

#### How reference data are managed 

The message may contain some reference data (for example, Item or Vendor code), how this will be managed. Typical scenarios here :

1. Web service accepts only a limited set of data. In this case, we probably need to create some tables in D365FO to maintain possible options.
2. Reference data are stable and will be loaded manually. For example, every month, a user loads a list of items to a website
3. Reference data changes quite often, and we need to develop a separate integration for this.
4. Web service can automatically create reference data from the message. In this case we need include all required fields for this (for example Item name, Vendor name, etc..)

#### Agreed error processing rules

How errors will be processed. Typical scenarios here:

1. All Web service business validations happen during a call. If a call is successful, that means that the document is accepted. (that is a preferred way)
2. During the call, the Web service checks only the message format, if it is good, the message is accepted.

Option 1 actually means that there should be someone from the D365FO team who will react to integration errors, make sure that this person has a documented support channel with the Web service support team. For example, how the returned message "Item AAA can't be purchased" will be processed.

Option 2 is simpler from the D365FO side, but it creates some challenges. You need to know the current status of the document somehow. This may be implemented as another integration(inbound to D365FO).

#### Data cardinality

The data structure may be different, and what is possible in D365FO may not be possible in other systems. For example, in D365FO, a Purchase order may contain multiple lines with the same item ID; some other systems may not allow this.  

#### Update rules

What happens if the user modifies the same document and sends the updated version? For example, in our case, multiple confirmations can be made for one purchase order, Web service should accepts the updated version.

#### Can 3-party modify their API to do this integration 

Systems may have different rules for data validations, and sometimes they don't match. How flexible is the 3-party team to modify their rules? Usually, there can be the following situations - API is public, used by several clients, and they can't modify it, or they may be flexible and allocate a developer to work on integration from their side.

#### Batch or real-time send

Do we want to export the document via a batch job (that means at least a couple of minutes delay) or immediately after the action 



Before exploring different integration scenarios, let's discuss common setup options.

### Connection types

The first form to setup an SFTP connection is **External integration – Connection types**.

It requires the hostname and user/password credentials to access this host.

![Connection types](ConnectionTypes.png)

The password can be stored in several ways:

- Manual entry - An unencrypted string suitable for development testing. It will remain after DB restores.
- Encrypted - An encrypted value.
- Azure Key Vault - A link to the standard D365FO key vault that stores the password.

### Outbound message types

In Outbound message types, we set parameters for our data export.

![Outbound message types](MessageTypeForm.png)

**Source group**
Here, we specify a link to the connection type and a folder on the SFTP server for data export.

**Processing group**
Contains a link to the class that performs the export. The class is a standard RunBase class (extended from **DEVIntegExportBulkBase**) that can define custom parameters and utilizes helper functions from the base class.

**File parameters**
Often, exports require creating a file name that includes a **date** component. This setting enables specifying a name template using the '%d' parameter. **Date format(%d)** defines how this symbol is converted into a date (e.g., you can include date-time or use just date). The format rules are defined by the .NET DateTime.ToString [format parameter](https://learn.microsoft.com/en-us/dotnet/api/system.datetime.tostring?view=net-7.0#system-datetime-tostring(system-string)).

**Delimiter** defines a CSV-type delimiter.

**Advanced Group**
The advanced group defines used log types and a Company range validation. The exports run in the current company, and some exports may be logically related only to certain companies. The **Company range** allows specifying a list of companies eligible for export.

## Export scenarios

Let's describe the most typical scenarios that can be used to export data from D365FO.

### Export Store Onhand Data (no-code scenario)

**Business scenario**: *Our company has a store, and we want to export daily onhand data from this store to our website. We need to include ItemId, Warehourse, and AvailiablePhysical value.*

The External integration module contains a **[DEVIntegExportBulkSQL](https://github.com/TrudAX/XppTools/blob/master/DEVTutorial/DEVExternalIntegration/AxClass/DEVIntegExportBulkSQL.xml)** class that allows exporting the result of a custom SQL string. This basic task can be done without writing any code.

```SQL
SELECT ITEMID, sum(availPhysical) as Qty, InventLocationId FROM INVENTSUM
WHERE CLOSEDQTY = 0 AND DATAAREAID = 'USMF' 
GROUP BY ITEMID, InventLocationId
HAVING sum(availPhysical) > 0
```

![Run onhand SQL export](OnhandSQLRun.png)

Then we can setup a standard daily batch job that generates a file in our output folder.

![Onhand SQL result](OnhandSQLResult.png)



## Troubleshooting and monitoring

Let's discuss how we can support our periodic exports.

### Test run parameter

One of the parameters of the base export class is a **Test run** checkbox. When running with this parameter, the export sends a file to a user's browser instead of SFTP. For incremental export, it also will not update the "Last exported date" field, so it will not break the export sequence. This is very handy when checking what will be exported without putting anything on SFTP. Also, developers may develop exports without needing to have a connection to SFTP.

![Recent download file](RecentDownloadFile.png)

### Export Log

The export log allows one to view how many lines were exported and the time it took to perform the export. For failed jobs, we can setup a standard D365FO alert.

![Export log](ExportLog2.png)

### Test connection

The **Test connection** button tries to connect to the specified SFTP folder and list files in it. So you can check the connection before running the export.

![Test connection](TestConnection.png)

## Summary

In this post, I have described different types of periodic exports to file from Dynamics 365 Finance and Operations based on the **External Integration** framework. We discussed the following exports:

- Simple SQL query export
- Export based on custom X++ code and query settings
- Incremental X++ export

All used classes can be found on [GitHub](https://github.com/TrudAX/XppTools/tree/master/DEVTutorial/DEVExternalIntegrationSamples) and can be used as a starting point for your own integrations.

I hope you find this information useful. As always, if you see any improvements, suggestions, or have questions about this work, don't hesitate to contact me.



X++ Dev Helper for Dynamics 365 F&O
