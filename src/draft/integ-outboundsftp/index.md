---
title: "XppInteg - Export data from D365FO to SFTP"
date: "2023-02-01T22:12:03.284Z"
tags: ["Integration"]
path: "/integ-outboundsftp"
featuredImage: "./logo.png"
excerpt: "The blog post describes the solution for exporting data from D365FO."
---

**External integration** is a framework that can be used to implement inbound and outbound integrations from D365FO. It supports several chanels: Azure file share, SFTP, Azure service bus and several integration types
Inbound async, Inbound sync, Outbound data, Outbound event basis. The framework designed to provide logging, error handling, troubleshooting for various integration types.

In this blog post I will describe how to export data from D365FO to SFTP server

## SFTP server setup

Several years ago Microsoft didn't provide any support for SFTP hosting, claiming that is obsollete in the cloud world, but it seems SFTP still quite popular among clients and finally it support was added to Azure storage servive

The option to access Azure storage via SFTP enpoint described in the following topic [SSH File Transfer Protocol (SFTP) support for Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/secure-file-transfer-protocol-support). In brief you need to create a storage account and enable SFTP access to it.

![SFTP Setup Azure](SFTPSetup.png)

and then create a SFTP user:

![SFTP User creation](SFPTSetup2.png)

Please note that SFTP access incur additioanal charges compared to Azure file storage(about 10$ per day). There are some alternatives to Azure SFTP, e.g. [files.com](files.com) that provides additional functions, like more granular access control.

## Client library to connect to SFTP

There are several .NET libraries to work with SFTP, but probably most popular is open source [SSH.NET](https://github.com/sshnet/SSH.NET). It add a reference Renci.SshNet.dll that can be used in X++.

To work with SFPT from the user interface I recommend [FileZilla](https://filezilla-project.org/)

![FileZilla](FileZilla.png)

## System setup

### Connection types

The first form to setup SFPT connection is **External integration – Connection types**

It requires the host name and User/Password to access this host

![Connection types](ConnectionTypes.png)

The password can be stored in several formats:

- Manual entry - unencrypted string, that may be used for dev testing
- Encrypted - Encrypted value
- Azure Key Vault - link to the standard D365FO key vault that stores the password

### Outbound message types

In Outbound message types we setup parameters for our export

![Outbound message types](MessageTypeForm.png)

**Source group**
Here we specify link to the connection type and a folder on SFTP server where to export the data

**Processing group**
Contains a link to class that performs the export. The class just a standard RunBase class(extended from **DEVIntegExportBulkBase**) that can define custom parameters and use some base class helper functions

**File parameters**
Very often the export needs to create a file with some date part in it. This settings allows to specify the name template with '%d' symbol. **Date format(%d)** defnes how this symbol is converted to date(e.g. you can include date-time or use just date). The rules for format are defined by the standard .NET DateTime.ToString [format parameter](https://learn.microsoft.com/en-us/dotnet/api/system.datetime.tostring?view=net-7.0#system-datetime-tostring(system-string))

**Delimiter** defines a CSV type delimeter

**Advanced group**
Advanced group defines used log types and a Company range validation. The export runs in the current company and some exports may be logically only related to certain companies. **Company range** allows to specify a list of companies where the export may run.

## Export scenarious

Let's describe most typical scenarious that can be used to export the data from D365FO

### Export store onhand data(no-code scenario)

**Business scenario**: *Our company has a store and we want to export daily onhand data from this store to our web site. We need to include ItemId, Warehourse and AvailiablePhysical value*

External integration module contains a **DEVIntegExportBulkSQL** class that allows to export the result of the custom SQL string and the basic task like this can be done even without writing any code.

```SQL
SELECT ITEMID, sum(availPhysical) as Qty, InventLocationId FROM INVENTSUM
WHERE CLOSEDQTY = 0 AND DATAAREAID = 'USMF' 
GROUP BY ITEMID, InventLocationId
HAVING sum(availPhysical) > 0
```

![Run onhand SQL export](OnhandSQLRun.png)

Then we can setup a standard daily batch job that generates a file in our output folder.

![Onhand SQL result](OnhandSQLResult.png)

### Export customers (no-code with data entity)

**Business scenario**: *In our D365FO ERP we maintain clients and want to implement daily export to the external system. We want to export Client Id, Name and E-mail*

This taks is the same as the previous one, but we will use a standard data entity to fetch the data

```SQL
SELECT [CUSTOMERACCOUNT], ORGANIZATIONNAME, PRIMARYCONTACTEMAIL FROM [CUSTCUSTOMERV3ENTITY]
WHERE DATAAREAID = 'USMF'
```

Message type setup is the following:

![Customers export setup](CustUSMF.png)

And a result will be a file with customers:

![Customers export results](CustUSMFResult.png)

### Export store onhand data(full X++ based procedure)

Examples above are great for prototyping, but it is very likely that "real word" export scenarious will be more complex than just using SELECT statement. In this case you need to write X++ code that generates the export data.

**Implementation concept:** In order to do this External integration provides the following consepts: We can't predict how complex will be our export, it may export to different sources(like SFTP, Azure storage, Service Bus), export data to one file or to multiple files, requires different parameters, etc.. So in order to do cover all possible scenarious we can use a standard RunBaseBatch class. But export classes  will have some common methods. So I created a base DEVIntegExportBulkBase(that extends RunBase) in order to store these common properties and methods(like variables to store number of exports records, methods to create log, writes data to a file, etc..). And the Export class should extend this DEVIntegExportBulkBase

Let's extend the previous task and check how this can be done

**Business scenario**: our company has a store and we want to export daily onhand data from this store. We want the quantity in sales unit and we also want the current sales price. Our export should be a CSV file that contain the following fields: ItemId, Style, AvailiablePhysical(in sales unit) and Sales Price

In order to do this we need to create a class that extends DEVIntegExportBulkBase. The code for this class is the following

A developer should write only export business logic related to the export

Warning message status. Export may finish Successfylly or may have an exception during the file generation(Error state). But sometimes you need to log an event, that the exported data has some issues, but still want to perform the export. For exampe, for some exported items we can't find a price. It is not a critical error, but we need to notify a user about this, he may adjust the query to exclude these items or notify another department to enter prices. To cover this scenario the export class may mark the status as Warning and the user may setup a standard alert for this



### Export invoices (incremental X++ procedure)

Let's describe the scenario where we need an incremental export

**Business scenario**: our company wants to export customer invoices to external system. The export runs daily and should include all invoices for this day. The export file should contain Account number, InvoiceIId, SalesId, Department dimension, Item, Qty,  LineAmount

To start with let's describe the typical mistake that sometimes I saw on projest. We need somehow track incremental changes and sometimes people using CreatedDateTime for this. The idea is you export all data up to the current time, save this time and next time process all records starting from this time. The problem with this aproach is that it doen't take into consideration existing transactions. The SQL transaction may start in 1pm, create an invoice at 1.05 and finish at 2pm. If the export runs at 1.30, it will not see 1.05 uncommited transaction and the invoice will not be exported. So better to avoid such architecture.

To implement incrementatl tracking I propose the following: Add 2 fields IsExported and ExportedDateTime to the invoices and update these fields after the export. It may not sound technically perfect(for example DMF may use SQL change tracking, so you don't need add any fields), but simplifies troubleshooting and provides a full visibility to a user, you can just open invoice and see it's status and when it was exported.

Another important concept here is there can be a situation when we need to reexport some data(for example export may contains errors or we need to add additional information to the export). WIth these status fields it is quite easy to implement



## Summary



I hope you find this information useful. As always, if you see any improvements, suggestions or have some questions about this work, don't hesitate to contact me.
