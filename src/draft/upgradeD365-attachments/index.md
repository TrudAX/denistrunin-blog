---
title: "D65FO upgrade. Transfer attachments from AX2012"
date: "2022-08-17T22:12:03.284Z"
tags: ["XppDEVTutorial", "Integration"]
path: "/upgradeD365-attachments"
featuredImage: "./logo.png"
excerpt: "The blog post describes a procedure to transfer attachments from AX2012 to D365FO"
---

An attachment migration procedure may be one of the tricky parts you may face during the AX2012 - D365FO project upgrade. In this post, I try to describe an **Attachments export/import journal** solution for doing such migration.

![Fun image](CloudFunny.jpg)

## D365FO Attachments types

As D365FO is a cloud-based system, attachment storage types may be different from what users get used previously. Let's discuss D365FO attachments types and the pros/cons of each of them:

- **Database**: attachments are stored in the database in a blob field. This is perfect for text attachments, like notes. You can edit the attachment content, but only from D365FO interface. The attachment is increasing D365FO database size.
- **Azure storage**: attachments are stored inside internal Azure storage, managed by Microsoft. Users can't edit the attachments(only download and upload files) and this storage account is accessible only from D365FO user interface. This approach does not consume DB space, Microsoft charges for storage separately
- **SharePoint**: attachments are stored on the SharePoint site, managed by the client. Users can edit attachments and documents are available outside of D365FO interface(for example you may use a group in Teams and attach a SharePoint folder to it). But in this case, the customer needs to maintain the SharePoint site

## Transfer attachment module description

There are already several ways of transferring attachments while doing a migration project from AX2012 to D365FO, but in this post, I will describe the additional method, and probable can be called "yet another way to transfer attachments from AX2012".

Some of the out-of-the-box ways for attachment migration are:
- [MoveDocumentsToDatabase](https://github.com/microsoft/Dynamics-365-FastTrack-Implementation-Assets/blob/master/AX2012DataUpgrade/MoveDocumentsToDatabase ) job from the FastTrack team. It moves all attachments to AX2012 database that can be used in the upgrade process
-  Standard entities for attachments creation(e.g. CustomerAttachmentsV2Entity). In case of entity usage, you need to create a ZIP data package that contains all files and the entity data.

The reason for development was to provide more flexibility and control over AX2012 attachment transfer.
Let’s check how it works

The module consists of AX2012 and D365FO part

### AX2012 functionality

It is an XPO project that needs to be imported into AX2012 live application. After the import run **DEVDocuExport** menu item

It will display the following window:

![Export dialog](ExportAx2012.png)

This dialog allows you to specify a related to attachments table and setup some filters for this table(e.g. export attachments only for not blocked customers)

As a result of this run, you will get a directory with all attachments to the selected table exported to files and a description file that links the primary table key to an attachment file.

![Export Ax2012 Result](ExportAx2012Result.png)

Using this file gives you huge flexibility, e.g. you can rename table keys or change document types mapping.

The next step is to copy the directory with AX2012 attachments to Azure storage. It can be done by using the following power shell command

```powershell
cmd.exe /C "cmdkey /add:`"aaavmstorage.file.core.windows.net`" /user:`"localhost\aaavmstorage`" /pass:`"BQubgv1NlZE+LtbbL8jKLrkVSwBlLHGuygbu9fy6gDv+UiRTiw63cpmVlAEVhSLCup1XRbbVajt6ww==`"" 
# Mount the drive 
New-PSDrive -Name Z -PSProvider FileSystem -Root \\aaavmstorage.file.core.windows.net\aaavmfileshare 

Copy-Item "C:\Attachments" -Destination "Z:\Attachments" -Recurse
```

# D365FO part

So we have our attachments in the cloud and it is time to import them into D365FO

After installing the required X++ objects open the following link

```html
https://mycompany.operations.dynamics.com/?cmp=CMP&mi=DEVDocuExpImpJournalTable

```

It will open the empty import attachment form

![Empty Journal Form](EmptyJournalForm.png)

The first step is to go to **Journal name** field(View detail) and create a new **Journal type**. A **Journal type** defines a reference to Azure file share, you need to specify a connection string and a share reference

![Journal Name Setup](JournalNameSetup.png)

Then you need to specify the Azure location for our import and press Test connection button to validate the settings

![Journal Setup](JournalSetup.png)

Journal created, the next step is to import lines from the Excel definition files created during the AX2012 export(**Import lines from Excel** button)

![Import Lines Function](ImportLinesFunction.png)

It will create journal lines(one line per file)

![Line View](LineView.png)

The final step is to load attachments, you can do this only for one line(to test the process) or for the whole journal. It will use the standard attach document procedure. so the attachment will be created according to the document type setup.

![Journal Status](JournalStatus.png)

And as the result, you get a destination table record with created attachments

![Cust Attachments](CustAttachments.png)

## Summary

The provided solution provides great flexibility for moving attachments from AX2012 to D365FO. All code used in this post can be found in the following folder(AX2012 project is stored as a resource): [https://github.com/TrudAX/XppTools/tree/master/DEVTutorial/DEVDocuExpImp](https://github.com/TrudAX/XppTools/tree/master/DEVTutorial/DEVDocuExpImp) 

I hope you find this information useful. As always, if you see any improvements, suggestions or have some questions about this work don't hesitate to contact me.
