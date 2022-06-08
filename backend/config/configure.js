const fs = require('fs');
const cert = fs.readFileSync('ssl/fts-stis-hcm-development.pub');

module.exports = {
    uploadFolder: './uploads/',
    rangeCoordinates: 0.028, // Same with zoom 16
    tokenExpireTime: 60 * 24 * 30, // 7 days
    cameraTypeList: {
        vov: {
            name: 'vov',
            configWith: ['server', 'camid']
        },
        vov_sony: {
            name: 'vov_sony',
            configWith: ['ip']
        },
        vov_dahua: {
            name: 'vov_dahua',
            configWith: ['ip']
        },
        tth: {
            name: 'tth',
            configWith: ['ip', 'channel']
        },
        tth_analog: {
            name: 'tth_analog',
            configWith: ['ip', 'channel']
        },
        tth_axis: {
            name: 'tth_axis',
            configWith: ['ip']
        },
        tth_paragon: {
            name: 'tth_paragon',
            configWith: ['ip']
        },
        udc_foscam: {
            name: 'udc_foscam',
            configWith: ['camid']
        },
        nguyenhue: {
            name: 'nguyenhue',
            configWith: ['ip']
        },
        sgcamera: {
            name: 'sgcamera',
            configWith: ['hostname']
        },
        kbcamera: {
            name: 'kbcamera',
            configWith: ['hostname', 'channel']
        },
        streaming: {
            name: 'streaming',
            configWith: ['streamingUrl']
        }
    },
    cameraConfigList: ['ip', 'hostname', 'server', 'camid', 'channel'],
    camerahost: 'http://localhost:3002',

    // secretKey: '_zuUWvu9d5ntORhcuwAksQ4LhKuZTEHxc3_om2svspyBn5FZG5IwKq6COGutnAL5',

    secretKey: cert,
    audience: 'https://dev-0gy0vn9g.us.auth0.com/api/v2/',
    auth0ManagementClient: {
        token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkxiY1FMNllmOE44QVlhZTdvTUw0SyJ9.eyJpc3MiOiJodHRwczovL2Rldi0wZ3kwdm45Zy51cy5hdXRoMC5jb20vIiwic3ViIjoia014aFpGVTlvTjhSZnZLd2hwc3J6eHlvdXdqdG5CVVhAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vZGV2LTBneTB2bjlnLnVzLmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNjUyMzcxOTIwLCJleHAiOjE2NTQ5NjM5MjAsImF6cCI6ImtNeGhaRlU5b044UmZ2S3docHNyenh5b3V3anRuQlVYIiwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSByZWFkOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl9jdXN0b21fYmxvY2tzIGRlbGV0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfdGlja2V0cyByZWFkOmNsaWVudHMgdXBkYXRlOmNsaWVudHMgZGVsZXRlOmNsaWVudHMgY3JlYXRlOmNsaWVudHMgcmVhZDpjbGllbnRfa2V5cyB1cGRhdGU6Y2xpZW50X2tleXMgZGVsZXRlOmNsaWVudF9rZXlzIGNyZWF0ZTpjbGllbnRfa2V5cyByZWFkOmNvbm5lY3Rpb25zIHVwZGF0ZTpjb25uZWN0aW9ucyBkZWxldGU6Y29ubmVjdGlvbnMgY3JlYXRlOmNvbm5lY3Rpb25zIHJlYWQ6cmVzb3VyY2Vfc2VydmVycyB1cGRhdGU6cmVzb3VyY2Vfc2VydmVycyBkZWxldGU6cmVzb3VyY2Vfc2VydmVycyBjcmVhdGU6cmVzb3VyY2Vfc2VydmVycyByZWFkOmRldmljZV9jcmVkZW50aWFscyB1cGRhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpkZXZpY2VfY3JlZGVudGlhbHMgY3JlYXRlOmRldmljZV9jcmVkZW50aWFscyByZWFkOnJ1bGVzIHVwZGF0ZTpydWxlcyBkZWxldGU6cnVsZXMgY3JlYXRlOnJ1bGVzIHJlYWQ6cnVsZXNfY29uZmlncyB1cGRhdGU6cnVsZXNfY29uZmlncyBkZWxldGU6cnVsZXNfY29uZmlncyByZWFkOmhvb2tzIHVwZGF0ZTpob29rcyBkZWxldGU6aG9va3MgY3JlYXRlOmhvb2tzIHJlYWQ6YWN0aW9ucyB1cGRhdGU6YWN0aW9ucyBkZWxldGU6YWN0aW9ucyBjcmVhdGU6YWN0aW9ucyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOmluc2lnaHRzIHJlYWQ6dGVuYW50X3NldHRpbmdzIHVwZGF0ZTp0ZW5hbnRfc2V0dGluZ3MgcmVhZDpsb2dzIHJlYWQ6bG9nc191c2VycyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgdXBkYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDphbm9tYWx5X2Jsb2NrcyBkZWxldGU6YW5vbWFseV9ibG9ja3MgdXBkYXRlOnRyaWdnZXJzIHJlYWQ6dHJpZ2dlcnMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyBjcmVhdGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiBkZWxldGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiByZWFkOmN1c3RvbV9kb21haW5zIGRlbGV0ZTpjdXN0b21fZG9tYWlucyBjcmVhdGU6Y3VzdG9tX2RvbWFpbnMgdXBkYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIGRlbGV0ZTpicmFuZGluZyByZWFkOmxvZ19zdHJlYW1zIGNyZWF0ZTpsb2dfc3RyZWFtcyBkZWxldGU6bG9nX3N0cmVhbXMgdXBkYXRlOmxvZ19zdHJlYW1zIGNyZWF0ZTpzaWduaW5nX2tleXMgcmVhZDpzaWduaW5nX2tleXMgdXBkYXRlOnNpZ25pbmdfa2V5cyByZWFkOmxpbWl0cyB1cGRhdGU6bGltaXRzIGNyZWF0ZTpyb2xlX21lbWJlcnMgcmVhZDpyb2xlX21lbWJlcnMgZGVsZXRlOnJvbGVfbWVtYmVycyByZWFkOmVudGl0bGVtZW50cyByZWFkOmF0dGFja19wcm90ZWN0aW9uIHVwZGF0ZTphdHRhY2tfcHJvdGVjdGlvbiByZWFkOm9yZ2FuaXphdGlvbnNfc3VtbWFyeSByZWFkOm9yZ2FuaXphdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGNyZWF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgcmVhZDpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBjcmVhdGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.NpRnBJ4wQnyM4Tp8R-EO7a-4CrSCkd8FBIHQPCYYPKfXJUHjYboO4mM11Y9yrM1VSTv_s2_7KrbcIfc_sD6iLoJ6uDftsH6fPsHJQtMWOqNbpovC5iCHq6DrOpSm-JC5QRzAL2GHLY1lSGZLs5wSiHfcYM6unnvGp9wsaaOeu7xD_S9MlJAUNi67jEmX74NzfhIW61trIAIRyM6FFrrhvztfW_zYYK6GM6e23se_Jct44s1QhXaQd0hBL55m-UAcZLeHBjDaMhIS6CAiqxbBYlXPOK8ECf1iFQRWttTLDiZvL9HHZ1sHVItEbR5VAPXUcd8T7ejBNkzoWDVIVI9nMQ',
        domain: 'dev-0gy0vn9g.us.auth0.com',
        clientId: '4iTVIOrKT5vVjBvDK0felIGt4TqCfOLV',
        clientSecret: 'q4BwehtczePPPHA4XicwBJmSNGCjdkBj2ufKwWNvkJ2AXkkN_BFl8hz55PVsGIEH',
        connection: 'Username-Password-Authentication'
    },
    listApiNotAuthenticate: ['/api/createtoken', /^\/api\/([^\s]+)\/uploads\/.*/, /^\/api\/([^\s]+)\/([^\s]+)\/([^\s]+)\/([^\s]+)\/geojson*/, '/api/setting/getimageerror', '/api/news', /^\/api\/roadevents\/*/, /^\/api\/monitors\/*/],

    trafficEventType: {
        normal: {
            name: 'Thông thoáng',
            color: 'green',
            type: 'normal'
        },
        congestion: {
            name: 'Đông xe',
            color: 'yellow',
            type: 'congestion'
        },
        jam: {
            name: 'Ùn tắc',
            color: 'red',
            type: 'jam'
        },
        incident: {
            name: 'Tai nạn',
            color: 'orange',
            type: 'incident'
        },
        flood: {
            name: 'Ngập nước',
            color: 'yellow',
            type: 'flood'
        }
    },
    cameraRefreshTime: 5000,
    cameraEndPoint: '//localhost:3000',
    roleCanViewUnpublish: ['admin'],
    consulHost: 'consul',
    consulTrafficSituation: 'dev_traffic'
};