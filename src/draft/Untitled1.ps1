cd C:\FinancialReporting\Server\MRDeploy\

Import-Module –Name C:\FinancialReporting\Server\MRDeploy\MRDeploy.psm1 -Verbose

New-ReportingDatabase

New-MRSetup  -IntegrateDDM

Set-MRDefaultValues -SettingName AXDatabaseName -SettingValue AxDB
#Set-MRDefaultValues -SettingName AosUserName -SettingValue denis.trunin@scalable.com.au
Set-MRDefaultValues -SettingName AosUserName -SettingValue AOSUser
Set-MRDefaultValues -SettingName AosUserName -SettingValue AOSWebSite@123

Set-MRDefaultValues -SettingName AosWebsiteName -SettingValue AOSService

Set-MRDefaultValues -SettingName MRSqlUserName -SettingValue AOSUser
Set-MRDefaultValues -SettingName MRSqlUserPassword -SettingValue AOSWebSite@123
Set-MRDefaultValues -SettingName MRSqlRuntimeUserName -SettingValue AOSUser
Set-MRDefaultValues -SettingName MRSqlRuntimeUserPassword -SettingValue AOSWebSite@123
Set-MRDefaultValues -SettingName DDMSqlUserName -SettingValue AOSUser
Set-MRDefaultValues -SettingName DDMSqlUserPassword -SettingValue AOSWebSite@123
Set-MRDefaultValues -SettingName DDMSqlRuntimeUserName -SettingValue AOSUser
Set-MRDefaultValues -SettingName DDMSqlRuntimeUserPassword -SettingValue AOSWebSite@123
Set-MRDefaultValues -SettingName AXSqlUserName -SettingValue AOSUser
Set-MRDefaultValues -SettingName AXSqlUserPassword -SettingValue AOSWebSite@123
Set-MRDefaultValues -SettingName AXSqlRuntimeUserName -SettingValue AOSUser
Set-MRDefaultValues -SettingName AXSqlRuntimeUserPassword -SettingValue AOSWebSite@123

Publish-PostReportingDatabaseConfiguration

Assert-MRDefaultValues

Get-MRDefaultValues

AosUserName                       : plt81denis\administrator
AosUserPassword                   : NA

AXDatabaseName                    : AXDBRAIN
AosSqlServerName                  : localhost

AosWebsiteName                    : AOSService
AosPortNumber                     : 443
AosServicePort                    : 443

FederationRealm                spn:00000015-0000-0000-c000-000000000000                                                     
UseIntegratedAuthentication    False    

ViewChangeTrackingUser         FinancialReportingUser                                                                       
DatabaseName                   AxDB                                                                                         
DatabaseUserName               FinancialReportingUser 

sqluser AOSUser --sqlpwd AOSWebSite@123                                                                       
                                                                                    


Get-AddAXDatabaseChangeTrackingParams



Write-MRStepMessage 'Adding AX database change tracking (Add-AXDatabaseChangeTracking)'
	$addAXDatabaseChangeTrackingParams = Get-AddAXDatabaseChangeTrackingParams
$addAXDatabaseChangeTrackingParams.CertificateUserName = "denis.trunin@scalable.com.au"
$addAXDatabaseChangeTrackingParams.UseIntegratedAuthentication = $TRUE
	Add-AXDatabaseChangeTracking @addAXDatabaseChangeTrackingParams
	Write-MRInfoMessage 'Added change tracking to AX database' -Success