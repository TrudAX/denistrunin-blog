---
title: "RunBase template class builder"
date: "2019-01-08T22:12:03.284Z"
tags: ["Addins"]
path: "/runbasebuilder-util"
featuredImage: "./logo.png"
excerpt: "'RunBase class builder' Add-in parameters description and usage scenarious"
---

This topic describes "RunBase class builder" Add-in, its parameters and usage. The purpose of this Add-in is to generate code template for a class that extends RunBaseBatch based on typical usage scenarios. Use the following link to download it.

## Main screen

Add-in can be run from the **Dynamics 365** - **Addins** - **RunBase class builder**

You can specify values for each parameter, preview the changes(using the Refresh button) and if you are fine with it, automatically generate the class and the related menu item.

![1546917739841](ToolMainScreen.png)

As a result, the following class will be generated

![1546919626624](ParmsWithQuery.png)

Let's describe the Add-in parameters

### -Class name

The name of the resulting class.

### -Description

The value that will be returned from the static description() method.

### -Parameters..

You can specify several parameters that will be displayed in the user dialog, one line per parameter. To describe the parameter the following information should be provided(values are separated by a | delimiter):

- **EDT** - Extended data type name for the dialog field. For mandatory fields add * at the end
- **Variable name** - class variable for this EDT. Can be empty, in this case, it will be generated from the EDT name
- **Label** - you can override EDT label for the field on the dialog form. If the Label is empty, EDT label will be used
- **Help text**- you can override EDT help text for the field on the dialog form. If it is empty, EDT help text will be used

The following code is generated for each parameter:

```csharp
//ClassDeclaration
CustAccount  custAccount;
DialogField  dlgCustAccount;
#localmacro.CurrentList
    custAccount
#endmacro
//dialog
dlgCustAccount     = dialog.addFieldValue(extendedtypestr(CustAccount), custAccount);
//getFromDialog
custAccount      = dlgCustAccount.value();
//parm method
public CustAccount parmCustAccount(CustAccount _custAccount = custAccount)...
```

### -Query table

If you want to display a query in the dialog, you need to specify the main table for this query. In this case, the following code will be added:

```csharp
//ClassDeclaration
QueryRun       queryRun;
//initQuery() sample code for query init
Query                   query = new Query();
QueryBuildDataSource    qbds = query.addDataSource(tablenum(CustTable));
QueryBuildRange         qBR;
;
qBR = SysQuery::findOrCreateRange(qbds, fieldnum(CustTable, RecId));
qBR.status(RangeStatus::HIDDEN);
queryRun = new QueryRun(query);
//pack() unpack() support for this queryRun
//run() - sample code
qBDS = queryRun.query().dataSourceTable(tableNum(CustTable));
        SysQuery::findOrCreateRange(qBDS, fieldnum(CustTable, RecId)).value(queryValue(""));

this.progressInit(RunBase::getDescription(classIdGet(this)),
                  SysQuery::countTotal(queryRun),
                  #AviSearch);
while (queryRun.next())
{
    custTable = queryRun.get(tablenum(CustTable));

    processedCounter++;
    progress.incCount();
}
```

### -External table name

Table name of the caller record should be specified. This covers a scenario when class is calling from a Menu item button on a form. Often, in this case, we need to save the caller record, to check for the caller record or to update the existing query based on the caller record.

The following code will be generated (**External table name** = CustTable)

```csharp
//ClassDeclaration
CustTable    callerCustTable;
//main
if (_args.dataset() != tablenum(CustTable))
{
    throw error(Error::missingRecord(funcname()));
}
runObject.parmCallerCustTable(_args.record());
if (_args && _args.record().TableId == tablenum(CustTable))
{
    qbds = runObject.queryRun().query().dataSourceTable(tablenum(CustTable));
    qbds.clearRanges();
    qbds.addRange(fieldnum(CustTable, RecId)).value(queryValue(runObject.parmCallerCustTable().RecId));
    //runObject.parmIsDisableUnpackQuery(true);
}

```

### -Add file upload

You need to specify 'y' symbol to generate code that allows a user to select a file from the local PC. It will add a fileUploadResult variable, a necessary code to handle this file and a sample code that displays uploaded text file content.

 ![1546932149579](FileUpload.png)

```csharp
//run()
memoryStreamFile = fileUploadResult.openResult();
AsciiStreamIo asciiIo = AsciiStreamIo::constructForRead(memoryStreamFile);
asciiIo.inRecordDelimiter('\n');
while (asciiIo.status() == IO_Status::Ok)
{
    container c = asciiIo.read();
    if (conLen(c) > 0)
    {
        info(strFmt("File data:%1", conPeek(c, 1)));
    }
}
```

Comparing to AX2012(where you can simply define a variable with the FileNameOpen type) adding file upload button requires more efforts in D365FO, as Dialog doesn't include new file control. I even created an idea to improve this https://experience.dynamics.com/ideas/idea/?ideaid=ac0834aa-216c-e711-80c0-00155d7cd0b4, but its status is still New.

### -Create menu item

Specify 'y' symbol to create an Action menu item, linked to the created class.

## Summary

This utility covers some common patterns of RunBase usage, so you can focus on business logic developing rather than typing standard code. If you find that something is missing or can be improved don't hesitate to leave a comment.
