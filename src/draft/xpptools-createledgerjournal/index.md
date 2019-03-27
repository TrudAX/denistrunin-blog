---
title: "Create LedgerJournalTrans in D365FO using X++"
date: "2019-03-06T22:12:03.284Z"
tags: ["XppDEVCommon"]
path: "/xpptools-createledgerjournal"
featuredImage: "./logo.png"
excerpt: "Programmatically create LedgerJournalTrans using X++ is quite a common task, in this post I describe possible options to perform it"
---

Programmatically create LedgerJournalTrans using X++ is quite a common task, in this post I describe possible methods to perform it.

## Using the LedgerJournalEngine class

This method using the LedgerJournalEngine class(the same class that is used when user creates the journal manually on the form). This 
increases the chances that the resulting line will be the same as manually created line.

```csharp
while select ledgerJournalTransOrig
    order by RecId
            where ledgerJournalTransOrig.JournalNum == _ledgerJournalTableOrig.JournalNum
{
    numLines++;
    if (!ledgerJournalTable.RecId)
    {
        //Often journal name from parameters is specified here
        DEV::validateCursorField(ledgerJournalName, fieldNum(LedgerJournalName, JournalName));
    
        ledgerJournalTable.clear();
        ledgerJournalTable.initValue();
        ledgerJournalTable.JournalName = ledgerJournalName.JournalName;
        ledgerJournalTable.initFromLedgerJournalName();
        ledgerJournalTable.JournalNum = JournalTableData::newTable(ledgerJournalTable).nextJournalId();
        ledgerJournalTable.Name = strFmt("Copy of %1, Date %2", _ledgerJournalTableOrig.JournalNum, DEV::systemdateget());
        ledgerJournalTable.insert();
    
        info(strFmt("Journal %1 created", ledgerJournalTable.JournalNum));
    
        ledgerJournalEngine = LedgerJournalEngine::construct(ledgerJournalTable.JournalType);
        ledgerJournalEngine.newJournalActive(ledgerJournalTable);
    }

    ledgerJournalTrans.clear();
    ledgerJournalTrans.initValue();
    ledgerJournalEngine.initValue(ledgerJournalTrans);
    ledgerJournalTrans.JournalNum           =   ledgerJournalTable.JournalNum;
    ledgerJournalTrans.TransDate            =   DEV::systemdateget();
    ledgerJournalTrans.AccountType          =   ledgerJournalTransOrig.AccountType;
    ledgerJournalTrans.modifiedField(fieldNum(LedgerJournalTrans, AccountType));
    
    ledgerJournalTrans.LedgerDimension = ledgerJournalTransOrig.LedgerDimension;
    if (!ledgerJournalTrans.LedgerDimension)
    {
        throw error("Missing or invalid ledger dimension for journal process");
    }
    ledgerJournalTrans.modifiedField(fieldNum(LedgerJournalTrans, LedgerDimension));
    ledgerJournalEngine.accountModified(LedgerJournalTrans);
        
    ledgerJournalTrans.OffsetAccountType = ledgerJournalTransOrig.OffsetAccountType;
    ledgerJournalTrans.modifiedField(fieldNum(LedgerJournalTrans, OffsetAccountType));
    ledgerJournalTrans.OffsetLedgerDimension = ledgerJournalTransOrig.OffsetLedgerDimension;
    ledgerJournalTrans.modifiedField(fieldNum(LedgerJournalTrans, OffsetLedgerDimension));
    ledgerJournalEngine.offsetAccountModified(ledgerJournalTrans);
    
    //amounts
    LedgerJournalTrans.CurrencyCode         =   ledgerJournalTransOrig.CurrencyCode;
    ledgerJournalEngine.currencyModified(LedgerJournalTrans);
    LedgerJournalTrans.AmountCurCredit      =   ledgerJournalTransOrig.AmountCurCredit;
    LedgerJournalTrans.AmountCurDebit       =   ledgerJournalTransOrig.AmountCurDebit;
    
    //additional fields
    LedgerJournalTrans.Approver           = HcmWorker::userId2Worker(curuserid());
    LedgerJournalTrans.Approved           = NoYes::Yes;
    ledgerJournalTrans.Txt                = ledgerJournalTransOrig.Txt;
    LedgerJournalTrans.SkipBlockedForManualEntryCheck = true;
    
    DEV::validateWriteRecordCheck(ledgerJournalTrans);
    ledgerJournalTrans.insert();
    ledgerJournalEngine.write(ledgerJournalTrans);
}
```

### Reference to the dimension

Sometimes you need to reference just one dimension value(for example get or set "Cost center" value). You don't see many examples of this in the standard application, as in most cases dimension merging is using. In AX2009 it was quite easy - you had an enum and could use it to get or set the value. In the current version, you need somehow to reference a record in the *DimensionAttribute* table and there is no "recommended" way of doing this. So, I have seen different implementations:

- Add *DimensionAttribute* to parameters(as String or as RecId)

- Create a new table with enum and reference to *DimensionAttribute*

- Search *DimensionAttribute* by backing table ID

- Search *DimensionAttribute* by name defined as a Macro

- ... sometimes combinations of these options to access the same dimensions

All this can create a real mess, some of these options require a setup, some aren't compatible with cross-references.

### Methods for working with Dimensions

There are a lot of classes to manipulate dimensions, so it is often difficult to find the right one. Moreover, classes related to dimension were renamed in D365FO(comparing to AX2012). As a result, developers sometimes create a duplicate of the existing methods.

For example, if you google "assign a value to default dimension" the first link will point to the 2-page method

![](DimLongMethod.png)

 Probably it can work but can cause difficulties with the support, performance and upgrades.

## Performance testing

Les't test what is the speed of these different methods. First I created a test journal with the 1000 lines(createByCombination method) and then copy it using the these 3 different methods. Results I got:

| Method                        | Time(sec) |      |
| :---------------------------- | :-------- | ---- |
| Using ledgerJournalEngine     | 30.54     |      |
| Using DataEntity              | 33.09     |      |
| Using Table defaultRow method | 15.18     |      |

There is some differences between the copy speed, but it is caused by the different logic for the dimension creation, so the result is that all methods are almost equal and quite fast. in real life scenario you can expect 10-20 lines per second insert speed  



## Summary

You can download this class using the following link https://github.com/TrudAX/XppTools/blob/master/DEVCommon/DEVCommon/AxClass/DEVDimensionHelper.xml

If you know some other methods that can be added into this class feel free to create a GitHub pull request or leave a comment.
