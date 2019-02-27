---
title: "30 additional methods to the Global class"
date: "2019-02-27T22:12:03.284Z"
tags: ["Xpp DEVCommon"]
path: "/xpptools-devglobal"
featuredImage: "./logo.png"
excerpt: "Global class is a standard class that contains a lot of small static functions. This post describes additional functions that extend it."
---

Global class is a standard class that contains a lot of small static functions. This post describes additional functions that extend it. To avoid using prefixes, all functions were added into the separate static class DEV. It exists in the [DEVCommon](https://github.com/TrudAX/XppTools#devcommon-model) model. As common practice, you can copy this class into your application as it is, or rename it according to your model name(e.g. ABC)

## DEV class methods

#### buf2Buf

Copies one cursor to another using field names(standard *buf2Buf* uses IDs). So you can copy values between different tables

```csharp
static void buf2Buf(Common _dest, Common _source, container _fieldsToExclude = conNull())
static void buf2BufMerge(Common _dest, Common _source)
```

#### canBeConverted, convertQty

The same functions as *UnitofMeasureConverter::canBeConverted* and *::convert* but with the string parameters instead of RecIds

```csharp
public static client server boolean canBeConverted(
        UnitOfMeasureSymbol     _fromUnitOfMeasure,
        UnitOfMeasureSymbol     _toUnitOfMeasure,
        ItemId                  _ItemId)
```

#### qty

Rounds the value according to unit settings

```csharp
static Qty qty(Qty  _qty, UnitOfMeasureSymbol  _unit)
```

#### cObject

Casts parameter to Object

```csharp
static Object cObject(Object  _obj)
{  return _obj;   }
```

#### countTotalQuick

Calculates the number of records in the query using Count(RecId). Standard *SysQuery::countTotal* switches to the loop mode when the query contains more than 1 DataSource.

```csharp
static Integer countTotalQuick(QueryRun _queryRun)
```

#### copyRanges

Copies DataSource ranges

```csharp
static void copyRanges(QueryBuildDataSource _qbdsTarget, QueryBuildDataSource _qbdsSource)
```

#### datasourceRangesAsText

Gets a string, that contains all ranges values. Used in reports to display current filter values in the report header.

```csharp
static Notes datasourceRangesAsText(QueryBuildDataSource _sourceDS)
```

#### date2DateTime, dateTime2Date

Converts date to DateTime using UserPreferredTimeZone

```csharp
static utcDateTime date2DateTime(TransDate _date, boolean _isEndOfDay = false)
static date dateTime2Date(utcDateTime _dateTime)
```

#### systemdateget

Returns the current date. It is still unclear for me, why the original method was marked as obsolete

```csharp
static TransDate systemdateget()
{ return DateTimeUtil::getSystemDate(DateTimeUtil::getUserPreferredTimeZone()); }
```

#### dateStartWk, dateStartYr

Returns the start of the week, the start of the year

```csharp
static TransDate  dateStartWk(TransDate _transDate)
static TransDate  dateStartYr(TransDate _transDate)
```

#### dsAllowEditExceptFields

Enable or disable all form DS fields, except specified

```csharp
static void dsAllowEditExceptFields(FormDataSource _formDataSource, boolean _allowEdit, container _fieldListExclude=connull())
```

#### dsGetDisabledFields

Get a list of the disabled fields. Used with the previous function when Datasource contains some code, that disables some fields, before dsAllowEditExceptFields call.  

```csharp
static container dsGetDisabledFields(FormDataSource _formDataSource)
```

#### dsRefresh, dsResearch, dsExecuteQuery

Performs datasource refresh/research/executeQuery

```csharp
static void dsRefresh(Common  _record)
static void dsResearch(Common _record, NoYes _savePosition = NoYes::Yes)
static void dsExecuteQuery(Common _record, NoYes _savePosition = NoYes::Yes)
```

#### getFormRunFromFormArgs

Gets the calling form from the current form args

```csharp
static Object getFormRunFromFormArgs(FormRun  _element, IdentifierName _formName)
```

#### queryHasRecord

Checks, that the query has a record. The common usage scenario is when you need to create a custom lookup for the field. In this case, you create a query for this lookup, create the lookup based on this query and add a check into the validateWrite() method to check that the entered value(user can enter the value using the manual entry) exists in this query  

```csharp
static boolean queryHasRecord(Query  _q)
```

#### isUserInRole

Is the current user included into the role

```csharp
static boolean isUserInRole(Description  _roleName)
```

#### purchTableConfirm

Confirms a purchase order

```csharp
static void  purchTableConfirm(PurchTable  _purchTable)
```

#### runButtonWithRecord

Executes menu item button with the specified record

```csharp
static void runButtonWithRecord(FormFunctionButtonControl _button, Common _record,
                                               Object _obj = null)
```

#### validateCondition

Validates the specified condition

```csharp
static boolean validateCondition(anytype _condition, str _message, boolean _isThrowError = false)
```

#### validateCursorIsNotEmpty

Performs if (! A.RecId) {throw error("..")}

```csharp
static void validateCursorIsNotEmpty(Common  _common, str _someText = '')
```

#### validateCursorField

Checks that the field is not empty and generates a message

```csharp
static boolean validateCursorField(Common _table, fieldId _fieldId, boolean _isThrow = true)
```

#### validateWriteRecordCheck

Calls a validateWrite() method and generates an error if it fails

```csharp
static void validateWriteRecordCheck(Common _record)
```

#### mergeInventDim

Merges 2 inventDim values

```csharp
public static InventDim mergeInventDim(
        InventDimGroupSetup         _dimGroupSetup,
        InventDim                   _fromInventDim,
        InventDim                   _addedDim)
```

#### w

Displays the current value - info(StrFmt('%1',_i));, using mostly for debug purposes.

```csharp
static void w(anytype _i, str _addition = '')
```

## Summary

You can download this class using the following link https://github.com/TrudAX/XppTools/blob/master/DEVCommon/DEVCommon/AxClass/DEV.xml

If you know some other helpful functions feel free to create a GitHub pull request or leave a comment.
