---
title: "D365FO class extensions naming tool"
date: "2019-12-12T22:12:03.284Z"
tags: ["Addins"]
path: "/d365utils-classextensionname"
featuredImage: "./logo.png"
excerpt: "Topic describes a solution for naming extension classes in D365FO"
---

In D365FO Microsoft introduced a new concept of extension classes. This concept is not aligned with the standard AOT elements as you need to create a new AOT classes to put your code related to extension. For example when you write your code for the form, all code is located in the form definition file. So you have the form design and all related code in one place. But for a form extension you create form extension design as one AOT object and all the code related to individual form extension components is located in separate AOT objects(extension classes). And this creates some new problem for developers - how to name these classes.

Microsoft created some basic guidelines for this - [Naming guidelines for extensions-Naming extension classes](https://docs.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/extensibility/naming-guidelines-extensions#naming-extension-classes), but it seems this page is not even used inside Microsoft teams.

Let's see what they recommend - technically extension classes are not new objects, so suffix should be used instead of prefix, and you need to create a distinction between object with the same names(like form **CustTable** and table **CustTable**)

![Microsoft naming guide](MSGuide.png)

Some objects from the standard code follow these rules, but many don't. Let's check standard objects in 10.0.5 application:

```c#
[ExtensionOf(tableStr(InventTable))]
public final class AppTroubleshooting_InventTable_Extension
```

Why the name is not InventTable**AppTroubleshooting**_Extension?

```c#
[ExtensionOf(formstr(BudgetReservationCreate_PSN))]
public final class BudgetReservationCreatePSN_Extension

[ExtensionOf(formStr(RetailStatementsPart))]
public final class RetailStatementsPart_Extension
```

These two are against the rule - "Don't name the extension just **_Extension**."

```c#
[ExtensionOf(formStr(SalesEditLines))]
internal final class RevRecSalesEditLines_Extension

[ExtensionOf(formStr(LedgerJournalTable))]
internal final class RevRecLedgerJournalTableForm_Extension
```

Here "**RevRec**" is used as a prefix instead of suffix, but more interesting that one developer have added a "**Form**" suffix and another forgot to add it.  

So organizing a naming convention even within Microsoft teams is quite hard task.

## Why this is important

Currently there is no combined view in Visual studio to view the final code(that includes all applied extensions and event handlers), so proper naming convention helps you to easily find objects and avoid code duplication(where the same logical function is implemented in two different classes).

It actually doesn't matter what rules you will follow, more important that within one project names should be the same.

## Solution to this problem - automatic class creation

First you need to define the naming conventions for your project. Currently there are 8 elements that can have extension classes, you need to define naming rules for all these elements(I have seen several dev guides where only 2 or 3 types where defined).

- Class
- Table
- DataEntityView
- View
- Form
- FormDataField
- FormDataSource
- FormControl

In addition to these rules you also need to define rules where to put your event handlers. Technically event handlers are static methods and can be created in any class, but you should not put these static methods to extension classes(details can be found in this article - https://daxmusings.codecrib.com/2018/06/accidental-code-extensions.html). I think the best approach to use the same names as for extensions, but with the different suffix **_EventHandler**, and for forms put all handlers into one class.

So totally you need to define 16 rules.

I created a setup form where you can define these naming rules and added a function to quickly define an initial template(currently there are only two: with "_" and without).

You can adjust the default settings and save it to file

![Setup form](SetupForm.png)

Next step is to exclude manual work when creating an extension classes. I extended my "Create extension class" add-in to automatically generate a class name based on these rules(this form can be called for any object that allows extension classes)

![Create class dialog](CreateClassDialog.png)

As the result the following class will be generated

```c#
[ExtensionOf(formstr(CustTable))]
final class CustTableForm_TST_Extension
```

## Summary

You can download this create class extension from the following https://github.com/TrudAX/TRUDUtilsD365/releases. If you find that something is missing or can be improved don't hesitate to leave a comment. If you have your own rules you can also send them to me(or create a Pull request) and I will add them as a option for the default settings.
