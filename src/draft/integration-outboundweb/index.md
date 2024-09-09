---
title: "Implement Event-based Data Export from D365FO to Web service"
date: "2024-09-12T22:12:03.284Z"
tags: ["Integration", "XppDEVTutorial"]
path: "/integration-outboundweb"
featuredImage: "./logo.png"
excerpt: "This blog post describes how to implement various scenarios for periodic data export from D365FO to a file and uploading it to SFTP server."
---

**External integration** is a [framework](https://github.com/TrudAX/XppTools?tab=readme-ov-file#devexternalintegration-submodel) designed for inbound and outbound integrations in D365FO. It supports several channels: Azure file share, SFTP, Azure service bus, and provides comprehensive features for logging, error handling, and troubleshooting.

In this blog post, I will describe how to implement periodic data export from D365FO to a file and upload it to an SFTP server.

## SFTP Server Setup

A few years ago, Microsoft did not support SFTP hosting, claiming it was obsolete in the cloud world. However, SFTP remains quite popular among clients and eventually, SFTP support was included in the Azure storage service.

To use Azure storage via an SFTP endpoint, you must first create a storage account and enable SFTP access. More information can be found here: [SSH File Transfer Protocol (SFTP) support for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/secure-file-transfer-protocol-support).

![SFTP Setup Azure](SFTPSetup.png)

Then, create an SFTP user:

![SFTP User creation](SFPTSetup2.png)

Please note that SFTP access incurs additional charges of about $10 per day compared to Azure file storage. Alternatives such as [files.com](https://files.com) offer additional features, including more granular access control.



## System Setup

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
