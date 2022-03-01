<p align="center">
<img src="https://lh3.googleusercontent.com/gR6vmCPWsJcXR54DVUtInhIJmreBYEbcU9x3xRZOtMIyNfr_IZDsxWH-lps6vz8js84oR9H9F2PK91iqQKqwdGyr8GRrI_JNpDYFwGcBhEVv79WNnHeioGU3QHiwVxl_A_tyU0pk_w=w2400" alt="Build Status" width="300">
</p>

# FormRead
<h2>Free OMR - OCR and BCR web software 
<h2>visit <a href="https://formread.org/">FormRead Page</a></h2>
### This Github project is meant only for documentation purposes and issues management

# REST API Documentation

For enterprise uses the API can be used by generating and Bearer Auth token.

Login in the FormRead <a href='https://formread.org/dashboard'>dashboard</a>. and access the API Token option

![image](https://user-images.githubusercontent.com/23704874/156108437-7e1ecc1b-5d82-4e47-a08b-31f98e7b525d.png)

Create the API tokens to allow third-party services to authenticate with our application on your behalf

![image](https://user-images.githubusercontent.com/23704874/156108468-d29b4c82-f1d6-4752-ab7f-ce89fd0d4c13.png)

Copy the token generated in a secure place (it will only be shown once)

![image](https://user-images.githubusercontent.com/23704874/156108490-7209c634-0b16-4d6f-8af9-50738382593f.png)


## Create New Form

### Request

`POST /api/forms/`

    curl --location --request POST 'https://formread.org/api/forms/' \
        --header 'Accept: application/json' \
        --header 'Authorization: Bearer grqr7w3pZ4u7Kif7CJpICzhBitOFXbq4VvXfGvMA' \
        --form 'form_name="new form"'

### Response

    {
        "id": 8,
        "form_name": "new form",
        "iframe_token": "6ifvCyEcjB3D5SGqtFmJ5eg0sPYNQfLoWCEgv7bb",
        "created_at": "2022-02-28T21:22:55.000000Z",
        "updated_at": "2022-02-28T21:22:55.000000Z"
    }

## Get Form by Id

### Request

`GET /api/forms/{form_id}`

    curl --location --request GET 'https://formread.org/api/forms/8' \
        --header 'Accept: application/json' \
        --header 'Authorization: Bearer kHMwPfhJC9rJyhR7h0L78j1OB9FXErF9JseFCXH9'

### Response

    {
        "id": 8,
        "form_name": "adsf",
        "thumbnail": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAA...",
        "iframe_token": "po75a0pqut4fa16XWgdEP2qRDwnhgfiqP3H0Dij6",
        "created_at": "2022-02-28T21:22:55.000000Z",
        "updated_at": "2022-03-01T01:40:19.000000Z"
    }

the `thumbnail` a src url that contains general img form:

![image](https://user-images.githubusercontent.com/23704874/156108528-c63f22b6-3f3b-4e50-899f-3613bcdb0b2f.png)


## Edit a Form

After a form is [Created](#create-New-Form) or [Retrieved](#get-form-by-Id) it can be displayed in an Iframe using the
`iframe_token` provided in the response (this token variates so make sure you [Retrieved](#get-form-by-Id) your form 
before rendering the iframe)

Create also a script that listen to the events of the iframe like in the example below:

    <!DOCTYPE html>
    <html style="height: 100%">
    <head>
        <meta charset="UTF-8">
        <title>Title</title>
    </head>
    <body style="height: 100%">

        <iframe src="https://formread.org/api/forms/8/edit/po75a0pqut4fa16XWgdEP2qRDwnhgfiqP3H0Dij6" style="height: 100%; width: 100%"></iframe>

        <script>
            var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
            var eventer = window[eventMethod];
            var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
    
            eventer(messageEvent, function (e) {
                // if (e.origin !== 'https://formread.org') return;
    
                if (e.data.method === "editForm"){
                    let formData = e.data.formData // data used to saved your form
                    let schema = JSON.parse(e.data.schema)
                    console.log(results)
                }
                if (e.data.method === "getResults"){
                    let results = JSON.parse(e.data.results)
                    console.log(results)
                }
    
            });
        </script>
    </body>
    </html>

When user save the, the `editForm` method will be triggered, there you have access to 2 varaibles:

- `formData` variable will contain the encoded form attributes that can be sent using the [Update](#update-form) 
to save the changes made to your form:
- the `schema` variable will let you know the fields created so far:


        {
            "file_name": {
                "type": "text"
            },
            "BCR-0": {
                "type": "text"
            },
            "OCR-1": {
                "type": "text"
            },
            "OMR-2-0": {
                "type": "select",
                "options": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                "questionIndex": "0"
            },
            "OMR-2-1": {
                "type": "select",
                "options": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                "questionIndex": "1"
            },
            "OMR-2-2": {
                "type": "select",
                "options": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                "questionIndex": "2"
            }
        }    

    This is meant only for you to display some alerts to your users in case you are requiring mandatory area fields to be 
    created:

When a user click on download results, the `getResults` method will be triggered, there you'll get the result data
in a `JSON` format

## Update Form

### Request

`GET /api/forms/{form_id}?_method=PUT`

    curl --location --request POST 'https://formread.org/api/forms/8?_method=PUT' \
    --header 'Authorization: Bearer kHMwPfhJC9rJyhR7h0L78j1OB9FXErF9JseFCXH9' \
    --form 'form_data="eyJ2dWV4X3N0YXRlIjp7ImZvcm1OYW1lIjoiYWRzZiIsImZvcm1zIjp7f
                       Swic2VsZWN0ZWRGb3JtSWQiOiIiLCJmb3JtUmVhZEFyZWFzIjp7IkJDUi
                       0wIjp7ImNvbHVtblBvc2l0aW9uIjoxLCJ3aWR0aCI6MC4xMTQ5NTA0NTM
                       0MDUzNTE2NCwiaGVpZ2h0IjowL...'

### Response

    {
        "id": 8,
        "form_name": "adsf",
        "iframe_token": "po75a0pqut4fa16XWgdEP2qRDwnhgfiqP3H0Dij6",
        "thumbnail": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU...",
        "created_at": "2022-02-28T21:22:55.000000Z",
        "updated_at": "2022-03-01T02:30:14.000000Z"
    }

## Delete Form

### Request

`GET /api/forms/{form_id}`

    curl --location --request DELETE 'https://formread.org/api/forms/8' \
        --header 'Accept: application/json' \
        --header 'Authorization: Bearer kHMwPfhJC9rJyhR7h0L78j1OB9FXErF9JseFCXH9'

### Response

    1



