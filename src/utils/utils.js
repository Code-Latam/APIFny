const crypto = require('crypto-js');
const forge = require('node-forge');

export function encodebody(originalbody)
{

    console.log("Original Body:");
    console.log(originalbody);

    const gwocuSettingsString = localStorage.getItem('gwocu-setting');
    const gwocuSettings = gwocuSettingsString ? JSON.parse(gwocuSettingsString) : null;

    console.log("Settings");
    console.log(gwocuSettings);
    const gwoken = gwocuSettings.gwokenEnabled ;
    const E2EE = gwocuSettings.E2EEEnabled ; 
    const gwokutoken = gwocuSettings.gwokenToken ;






    // const gwoken = process.env.REACT_APP_GWOKEN ;
    // const E2EE = process.env.REACT_APP_E2EE ;    ;
    // const gwokutoken = process.env.REACT_APP_GWOKUTOKEN ;



    

    if (gwoken) // if gwoken calculation is necessary
    {
        // check if EE2E is necessary and if so add the public key of the admin module so the backend can respond with encryption
        if (E2EE)
            {
                originalbody.apiPublicKey = process.env.REACT_APP_PUBLIC_KEY;
            }
        
        console.log("GWOKUToken before calling calculatesignature");
        console.log(gwokutoken);
        const MySignature = CalculateSignature(gwokutoken, originalbody);
        originalbody.gwoken = MySignature;
    }

    if (E2EE)
    {
        var backendpublicKeyPem = process.env.REACT_APP_BACKEND_PUBLIC_KEY;
        var backendpublicKey = forge.pki.publicKeyFromPem(backendpublicKeyPem);

        /**** START Encrypt AES with assymetric RSA-OAEP key and set body ekey variable ****/

        var aesKey = forge.random.getBytesSync(16); // generate random 16 bits key

        var encryptedaesKey = backendpublicKey.encrypt (aesKey, 'RSA-OAEP');
        var encoded64encryptedaesKey = forge.util.encode64 (encryptedaesKey); 
        
        /**** END OF Encrypt AES key ****/

        
        /**** START Encrypt message with symetric AES key ****/
        // add the public key of the admin module so the backend can respond with encryption
        originalbody.apiPublicKey = process.env.REACT_APP_PUBLIC_KEY;

        var originalMessageString = JSON.stringify(originalbody);
        var cipher = forge.cipher.createCipher('AES-CBC', aesKey);
        cipher.start({iv: aesKey}); // use the same key as iv for simplicity
        cipher.update(forge.util.createBuffer(originalMessageString));
        cipher.finish();
        var encryptedMessage = cipher.output.getBytes(); // get encrypted message
        var ecoded64encryptedMessage = forge.util.encode64(encryptedMessage); // encode to 64 so it can be sent

        /**** END OF Encrypt message with symetric AES key ****/
        const myreturnbody =
        {
            ekey:encoded64encryptedaesKey,
            message:ecoded64encryptedMessage
        }
        console.log(myreturnbody);
        return myreturnbody;
    }
    else
    {
        return originalbody;
    }

}


function CalculateSignature(token,parameters)
{
    // calculate the hash value of the token
    console.log("GWOCU TOKEN on first line of CALCULATE SIGNATURE");
    console.log(token);
    console.log("PARAMETER FOR on first line CALCULATE SIGNATURE");
    console.log(parameters);

    
    // var ApiTokenHashvalue = CryptoJS.MD5(str_1 + str_2).toString();
    var ApiTokenHashvalue = crypto.MD5(token).toString();
    
    // order parameters alfabetically
    var SortedParams = sortObjByReverseKey(parameters);
    
    // Concatenate: add '&' between key and value pair and replace : for = 
    var MyString = '' ;
    for (const [key, value] of Object.entries(SortedParams)) {
        MyString += (`${key}=${value}&`);}

    //  add hash value of token at the and of the string
    MyString += ApiTokenHashvalue ;

    // create the verifySign

    const MySignature = crypto.MD5(MyString).toString();

    return MySignature;
    }

    
// algabetical sort helper function
    function sortObjByReverseKey(obj) 
    {
    return Object.keys(obj).sort(function (a, b) {
      return a.split("").reverse().join("").localeCompare(b.split("").reverse().join(""));
    }).reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
  }

  export function getDecodedBody(data) {
    const failure = "Decryption failed. API result unknown"
    if (typeof data === 'string')
    {
      return data;
    }
    else // data is an object
    {
      if (data.ekey) // server is sending encryption
        {
          const decryption = endToEndDecrypt(data); 
          if (!decryption[0])
          { return failure}
          else
          { 
            return decryption[1]
          }
        }  
      else // server is sending unencoded object
     {
        return data;
     }    
    }
  }


  function endToEndDecrypt(body) {

    // Get private key of frontend
    
    const frontendPrivateKey = process.env.REACT_APP_PRIVATE_KEY;
    
    // create a private key forge object
    
    const privateKey = forge.pki.privateKeyFromPem(frontendPrivateKey);
    
    // bring both key and message to 64 base
    
    var ekeydecodedfrom64 = forge.util.decode64(body.ekey)
    var messagedecodedfrom64 = forge.util.decode64(body.message);
    
    // We will first decrypt the key that was used to encrypt the message
    
    const decryptedAESkey = privateKey.decrypt(ekeydecodedfrom64, 'RSA-OAEP');
    
    // now we will decrypt the message
    
    var decipher = forge.cipher.createDecipher('AES-CBC', decryptedAESkey);
    decipher.start({iv: decryptedAESkey}); // use the same key as iv for simplicity
    decipher.update(forge.util.createBuffer(messagedecodedfrom64));
    decipher.finish();
    var decryptedData = decipher.output.getBytes();
    
    // Convert the decrypted data to a JSON object
    
    try {
      const data = JSON.parse(decryptedData);
      console.log("DYCRYPTED DATA");
      console.log(data);
      return [true, data];
    } 
    catch (error) {
      return [false,"none"]
    }
     
    
      };

// module.exports.encodebody = encodebody;
// module.exports.getDecodedBody = getDecodedBody;