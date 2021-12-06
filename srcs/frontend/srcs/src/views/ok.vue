<template>
  <div></div>
</template>

<script setup lang="ts">

function GetQueryStringVal(lQuery: string) {
  var lDoc = String(document.location);
  var lSignet = "";
  var n1 = lDoc.indexOf("?");

  if (n1 > 0) {
    var n2 = lDoc.indexOf("?" + lQuery + "=", n1);
    if (n2 < n1) n2 = lDoc.indexOf("&" + lQuery + "=", n1);
    if (n2 >= n1) {
      n2 = n2 + ("?" + lQuery + "=").length;
      var n3 = lDoc.indexOf("&", n2 + 1);
      if (n3 > n2) lSignet = lDoc.substring(n2, n3);
      else lSignet = lDoc.substring(n2);
    }
  }
  return lSignet;
}
const code = GetQueryStringVal("code");

console.log("code = ", code);

if (!code) {
  window.location.href = "";
}

async function isLogin() {
    
    var response = await fetch("http://localhost:3000/user/isLogin", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
        Accept: "application/json",
        "Access-Control-Max-Age": "600",
        "Cache-Control": "no-cache",
        },
    });
    const ret = await response.json();
    return ret;
}

/* On effectue la requête */
async function login() {
    
    const ret = await isLogin();
    if (ret.log)
        window.location.href = "http://localhost:8080";
    //alert(ret.log);
    var response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Max-Age": "600",
        "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
        code: code,
        }),
    });
    const data = await response.json();
    await localStorage.setItem("src", JSON.stringify(data.src));
    await localStorage.setItem("usernamee", JSON.stringify(data.username));
    
    
  //   await localStorage.setItem("state", JSON.stringify(data.state));

    if (data.state) {
      window.location.href = "http://localhost:8080";
    } else {
      window.location.href = "http://localhost:8080/register";
    }

}
login()
</script>

<style scoped>
</style>