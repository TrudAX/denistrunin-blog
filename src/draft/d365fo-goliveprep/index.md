Notes about Go-Live preparation



### Enviroments plannig 

Microsoft provides 1 Tier2 enviroment as a part of the standard subscription. The biggest hint here - don't name this enviroment as UAT(User testing). It should be named as PrePROD(PP or PPN). 

If you have some issue to debug that can't be replicated on DEV/TEST enviroment, probably it is a data-related issue, and you need to create a database copy.**PROD** database can be copied to **PRE-PRED** only. It takes 1h. For the first several days, I suggest doing this refresh every day at the end of the day. So All PRE-PROD data will be overwritten. This may create an issue for integrations and some external access as encrypted data will be not copied during the refresh. 

Create a document or some automation procedure that allow to restore these settings.

### Data management

The only way to get a copy of **PROD** database is to move the data to **PRE-PRED** . It takes 1h. Then **PRE-PRED** database can be exported as a bacpac to LCS(it is another hour) and moved to a Tier1 enviroment(Test or DEV). The convertion procedure may take 30-60 minutes for a small database. 

By default this process takes a lot of manual steps, but I shared some automation scripts that may save some time

If you have multiple developers that require fresh data I suggest the following approach - Perform backpack to SQL conversion on one VM and then load the SQL backup to Azure file share. Then developers can use this script to upload the file to their boxes in one click



### Release management

Proper release management planning is a key process to smoth go-live experience. Don't believe that the first days will be without errors, even on fully tested system they may happen. And don't plan any "code freeze", for the first several weeks you will need to do many releases. I suggest plan the following approach

- A planned release at evening every day
- An emergency release window in the morining and at lunchtime

Currenly every release requires 40 minutes of downtime, from my point of view that is a huge D365FO system drawback, hope Microsoft will fix that in the future, but now we have what we have.

How release happens and some timings:

- Developer fix and test the issue on DEV
- The fix is deployed to PreProd for the final validation(this should be done via Pipeline), it takes 1.5h
- Release person should login to LCS, mark the PrePROD package as a Release candidate, swith to PROD enviroment, shedule the release(40 min of downtime)

Also the poing to consider here that PROD relase can't be fully automated and requires some manual effors. Make sure that you discuss this with the person who will do releases that some overtime work is needed.

### Branch management

During the GoLive phase simplify the brach namagement as simple as possible. I suggest keep just one Main branch strategy or Main-Release 



### Integration issues 

During the initial GoLive phase you may see the full set of errors:

For inbound integration you may faced the following issues:

- External system may send messages in wrong format
- With the wrong values
- Duplicated messages
- On D365FO side some fields may be incorrectly mapped
- Some required D365FO settings may be missed/incorrectly specified during the message processing.

For outbound integration typical problems are the following:

- External system may complain that they didn't reveived some documents from you
- Reveived messages contained wrong values for individual fields

[XPPInteg(External integration)](https://github.com/TrudAX/XppTools#devexternalintegration-submodel) module is designed to provide all logging and replay/debug every message to investigate all these issues, but if you using some other integration approach make sure that the team has a plan to resolve every type of integration issues. 

