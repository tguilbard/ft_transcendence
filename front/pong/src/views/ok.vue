<template>
    <div>

    </div>
</template>

<script>

      /* On effectue la requête */
        async function get_salut(xsrfToken)
        {
            const headers = await new Headers();
            headers.append('x-xsrf-token', xsrfToken);
        
            const options4 = {
              method: 'GET',
              mode: 'cors',
              headers,
              credentials: 'include',
            };
            const response = await fetch('http://localhost:3000/salut', options4);
          const data = await response.json();
          console.log('msg = ', data);
        }
    
    function GetQueryStringVal(lQuery)
    {
        
        var lDoc=String(document.location); 
        var lSignet = ""; 
        var n1 = lDoc.indexOf("?"); 

        if (n1 > 0) 
        { 
            var n2 = lDoc.indexOf("?" + lQuery + "=",n1); 
        if (n2 < n1) 
            n2 = lDoc.indexOf("&" + lQuery + "=",n1); 
        if (n2 >= n1) 
        { 
            n2 = n2 + ("?" + lQuery + "=").length; 
            var n3 = lDoc.indexOf("&",n2+1); 
            if (n3 > n2) 
            lSignet = lDoc.substring(n2, n3); 
            else 
            lSignet = lDoc.substring(n2); 
        } 
        }
        return lSignet;
    }
    const code = GetQueryStringVal('code');

    console.log('code = ', code);

    if (!code)
    {
        window.location.href = '';
    }

    const options2 = {
        method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
          'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Max-Age': '600',
      'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
          code: code
      })
    };

    /* On effectue la requête */
    async function login()
    {
        const response = await fetch('http://localhost:3000/login', options2);
      //const data = await response.json();
    //   await localStorage.setItem('xsrfToken', JSON.stringify(data));
    //   console.log('data = ', data);
    // const Token = await localStorage.getItem('xsrfToken');

    // const xsrfToken = await JSON.parse(Token);
    // console.log('tok get from localstorage = ', xsrfToken);
    // get_salut(xsrfToken.xsrfToken);
    window.location.href = "http://localhost:3000/register";

    }
    
  

    login();
    





</script>

<style scoped>

</style>