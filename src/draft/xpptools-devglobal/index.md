---
title: "Go Global"
date: "2019-02-13T22:12:03.284Z"
tags: ["Xpp common"]
path: "/xpptools-devglobal"
featuredImage: "./logo.png"
excerpt: "Fields list form is an extended version of the standard Show all fields form with the additional features such as displaying all fields with the extended information, comparing and editing"
---

[Fields list form](https://github.com/TrudAX/XppTools#-fields-list) is an extended version of the standard **Show all fields** form with the additional features such as displaying all fields with the extended information, comparing and editing.

Global class is a popular class that contains a lot of small functions to help you perform typical development actions. This post related to similar functions. Class name is DEV. As a common practice you can copy it into your application as is, or rename it to your model name(e.g. ABC)

## Functions list

#### buf2Buf 

Copies one cursor to another using copy by field names(standard buf2Buf using IDs)

```csharp
static void buf2Buf(Common _dest, Common _source, container _fieldsToExclude = conNull())
static void buf2BufMerge(Common _dest, Common _source)
```

#### canBeConverted, convertQty

The same functions as UnitofMeasureConverter::canBeConverted and ::convert but with the string parameters instead of RecIds

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

Object cast

```csharp
static Object cObject(Object  _obj)
{  return _obj;   }
```

#### countTotalQuick

Calculates number of records in the query using Count(RecId). Standard SysQuery::countTotal switches to the loop mode when the query contains more than 1 datasource. 

```csharp
static Integer countTotalQuick(QueryRun _queryRun)
```

#### copyRanges

Copies datasource ranges

```csharp
static void copyRanges(QueryBuildDataSource _qbdsTarget, QueryBuildDataSource _qbdsSource)
```

#### datasourceRangesAsText

Gets a string, that contains all ranges values. Used in reports to display current filter values in the report header.

```csharp
static Notes datasourceRangesAsText(QueryBuildDataSource _sourceDS)
```

#### date2DateTime, dateTime2Date

Converts date to datetime using UserPreferredTimeZone

```csharp
static utcDateTime date2DateTime(TransDate _date, boolean _isEndOfDay = false)
static date dateTime2Date(utcDateTime _dateTime)
```

#### dsAllowEditExceptFields

Enable or disable all form DS fields, except specified 

```csharp
static void dsAllowEditExceptFields(FormDataSource _formDataSource, boolean _allowEdit, container _fieldListExclude=connull())
```

#### dsGetDisabledFields

Get a list of the disabled fields. Used with the previous function when Datasource contains some code, that before dsAllowEditExceptFields call disables some fields.  

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

#### isQueryHasRecord

Checks, that the query has a record. Common usage scenario is when you need to create a custom lookup for the field. In this case you create a query for the lookup, create a lookup based on this query and add a check into the validateWrite() method to check that the entered value(user can enter the value using the manual entry) is exists in this query  

```csharp
static boolean isQueryHasRecord(Query  _q)
```

#### isUserInRole

User included to the role

```csharp
static boolean isUserInRole(Description  _roleName)
```

#### purchTableConfirm

Confirms purchase order

```csharp
static void  purchTableConfirm(PurchTable  _purchTable)
```

#### runButtonWithRecord

Executes form menu item button with the specified record

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

#### copyRanges

Copies datasource ranges

```csharp
static void copyRanges(QueryBuildDataSource _qbdsTarget, QueryBuildDataSource _qbdsSource)
```

#### copyRanges

Copies datasource ranges

```csharp
static void copyRanges(QueryBuildDataSource _qbdsTarget, QueryBuildDataSource _qbdsSource)
```

#### copyRanges

Copies datasource ranges

```csharp
static void copyRanges(QueryBuildDataSource _qbdsTarget, QueryBuildDataSource _qbdsSource)
```

#### copyRanges

Copies datasource ranges

```csharp
static void copyRanges(QueryBuildDataSource _qbdsTarget, QueryBuildDataSource _qbdsSource)
```

#### copyRanges

Copies datasource ranges

```csharp
static void copyRanges(QueryBuildDataSource _qbdsTarget, QueryBuildDataSource _qbdsSource)
```

#### copyRanges

Copies datasource ranges

```csharp
static void copyRanges(QueryBuildDataSource _qbdsTarget, QueryBuildDataSource _qbdsSource)
```































## Summary

**Fields list** tool in some cases can simplify and increase the development speed. You can download it using the following link - https://github.com/TrudAX/XppTools#installation

Feel free to post any comments(better as a GitHub issue) or ideas, what else can be improved.
