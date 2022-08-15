---
title: "D65FO upgrade. Transfer attachments from AX2012"
date: "2022-05-17T22:12:03.284Z"
tags: ["XppDEVTutorial", "Integration"]
path: "/upgradeD365-attachments"
featuredImage: "./logo.png"
excerpt: "The blog post describes a procedure to transfer attachments from AX2012 to D365FO"
---

Attachments export/import journal name

## Transfer attachment module description 

There are already several ways of transferring attachments while doing a migration project from AX2012 to D365FO, but in this post I will describe additional method, and probable can be called "yet another way to transfer attachments from AX2012".

The reason for development was to provide more flexibility and control over AX2012 attachment transfer.
Lets check how it works

Module consists of AX2012 and D365FO part

### AX2012 functionality

It is an XPO project that needs to be imported into AX2012 live application. After the import run **DEVDocuExport** menu item

It will display the following window:

![Export dialog](ExportAx2012.png)

This dialog allows you to specify a related to attachments table and setup some filters for this table(e.g. export attachments only for not blocked customer)

As the result of this run you will get a directory with all attachments to the selected table exported to files and a description file that links the primary table key to a attachment file.

![Export Ax2012 Result](ExportAx2012Result.png)

Using this file give you a huge flexibility, e.g. you can rename table keys or change document types mapping.

The next step is to copy the directory wtih AX2012 attachments to Azure storage. It can be done by using the following power shell command

```powershell
cmd.exe /C "cmdkey /add:`"aaavmstorage.file.core.windows.net`" /user:`"localhost\aaavmstorage`" /pass:`"BQubgv1NlZE+LtbbL8jKLrkVSwBlLHGuygbu9fy6gDv+UiRTiw63cpmVlAEVhSLCup1XRbbVajt6ww==`"" 
# Mount the drive 
New-PSDrive -Name Z -PSProvider FileSystem -Root \\aaavmstorage.file.core.windows.net\aaavmfileshare 

Copy-Item "C:\Attachments" -Destination "Z:\Attachments" -Recurse
```

# D365FO part

So we have out attachments in the cloud and it is time to import them into D365FO

After installing required X++ objects open the following link

```html
https://mycompany.operations.dynamics.com/?cmp=CMP&mi=DEVDocuExpImpJournalTable

```

It will open the empty import attachment form

![Empty Journal Form](EmptyJournalForm.png)

First step is go to **Journal name** field(View detail) and create a new **Journal type**. A **Journal type** defines a reference to Azure file share, you need to specify a connection string and a share reference

![Journal Name Setup](JournalNameSetup.png)

Then you need to specify Azure location for our import and press Test connection button to validate settings

![Journal Setup](JournalSetup.png)

Journal created, the next step is to import lines from the Excel definition files created duting the AX2012 export(**Import lines from Excel** button)

![Import Lines Function](ImportLinesFunction.png)

It will create journal lines(one line per file)

![Line View](LineView.png)

The final step is to load attachments, you can do this only for one line(to test the process) or for the whole journal. It will use the standard attach document procedure. so the attachment will be created according to the document type setup. 

![Journal Status](JournalStatus.png)

And as the result you get a destination table record with created attachments 

![Cust Attachments](CustAttachments.png)

## Summary


All code used in this post can be found in the following folder. Another important question when you implement a solution like this: is how fast will be your integration. I wrote about sample steps for performance testing in the following post: [https://github.com/TrudAX/XppTools/tree/master/DEVTutorial/DEVDocuExpImp](https://github.com/TrudAX/XppTools/tree/master/DEVTutorial/DEVDocuExpImp) 

I hope you find this information useful. As always, if you see any improvements, suggestions or have some questions about this work don't hesitate to contact me.