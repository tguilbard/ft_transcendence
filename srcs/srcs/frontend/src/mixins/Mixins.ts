import { Achievements, UserEntity } from '../interface/interface';
import store from '../store';

  export default {
    joinPrivate(name: string): void {
        store.state.socket.emit('joinPrivate', name);
      },

    isBlock(username: string) {
        return store.getters.GET_LIST_BLOCKED.find(e => e == username);
    },

    joinPublic(name: string, mdp: string): void {
        store.state.socket.emit('joinPublic', name, mdp);
    },

    createPublic(name: string, mdp: string): void {
        store.state.socket.emit('createPublic', name, mdp);
    },

    createPrivate(name: string): void {
        store.state.socket.emit('createPrivate', name);
      },

    async getListBlocked(): Promise<string[]> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/users/blocked`, {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Access-Control-Max-Age": "600",
            "Cache-Control": "no-cache",
          },
        });
        if (response.ok) return await response.json();
        return [];
      },

    async isLogin(): Promise<boolean> {
        alert
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/users/isLogin`, {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Access-Control-Max-Age": "600",
                "Cache-Control": "no-cache",
            },
        });
        if (response.ok)
            return (await response.json()).log
        return false;
    },

    async getAchievements(username: string): Promise<Achievements[]> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/users/` + username + "/achievements", {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Access-Control-Max-Age": "600",
                "Cache-Control": "no-cache",
            },
        });
        if (response.ok)
            return await response.json()
        return [];
    },

    async getLeaderBoard(): Promise<[UserEntity]> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/users/leaderboard`, {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Access-Control-Max-Age": "600",
                "Cache-Control": "no-cache",
            },
        });
        if (response.ok)
            return await response.json()
        return [{}];
    },


    async isAccess(p_path: string): Promise<boolean> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/access/` + p_path, {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Access-Control-Max-Age": "600",
                "Cache-Control": "no-cache",
            },
        });
        if (response.ok)
            return (await response.json()).log
        return false;
    },

    async isGuest(username: string): Promise<boolean> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/users/isGuest/` + username, {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Access-Control-Max-Age": "600",
                "Cache-Control": "no-cache",
            },
        });
        if (response.ok)
            return response.json();
        return false;
    },
    async myGuest(): Promise<boolean> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/users/myGuest`, {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Access-Control-Max-Age": "600",
                "Cache-Control": "no-cache",
            },
        });
        if (response.ok)
            return response.json();
        return false;
    },

    async getQrCode(): Promise<string> {
        return await fetch(`http://${process.env.VUE_APP_ADDRESS}/2fa/generate`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Max-Age": "600",
                "Cache-Control": "no-cache",
            }
        })
            .then((response) => {
                if (response.ok)
                    return response.blob();
                else
                    "";
            })
            .then((blob) => {
                if (blob)
                    return URL.createObjectURL(blob);
                else
                    return "";
            });
    },

    GetQueryStringVal(lQuery: string): string {
        const lDoc = String(document.location);
        let lSignet = "";
        const n1 = lDoc.indexOf("?");

        if (n1 > 0) {
            let n2 = lDoc.indexOf("?" + lQuery + "=", n1);
            if (n2 < n1) n2 = lDoc.indexOf("&" + lQuery + "=", n1);
            if (n2 >= n1) {
                n2 = n2 + ("?" + lQuery + "=").length;
                const n3 = lDoc.indexOf("&", n2 + 1);
                if (n3 > n2) lSignet = lDoc.substring(n2, n3);
                else lSignet = lDoc.substring(n2);
            }
        }
        return lSignet;
    },

    async getListMatchs(username: string): Promise<string[]> {
        const response = await fetch(
          `http://${process.env.VUE_APP_ADDRESS}/game-history/` + username,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Access-Control-Max-Age": "600",
              "Cache-Control": "no-cache",
            },
          }
        );
        if (response.ok) return await response.json();
        return [];
      },

    async get_avatar(username: string): Promise<string> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/avatar/` + username , {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            "Access-Control-Max-Age": "600",
            "Cache-Control": "no-cache",
          },
        });
        if (!response.ok) {
          return "";
        }
        const myBlob = await response.blob();
        return await URL.createObjectURL(myBlob);
      },

      async getUserInChan(chanName: string): Promise<UserEntity[]> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/userInChan/` + chanName, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
            Accept: "application/json",
            "Access-Control-Max-Age": "600",
            "Cache-Control": "no-cache",
        },
        });
        if (response.ok)
            return await response.json();
        return [{}];
    },

    async getMyUser(): Promise<UserEntity> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/users/MyUser`, {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Access-Control-Max-Age": "600",
                "Cache-Control": "no-cache",
            },
        });
        if (response.ok)
          return await response.json();
        return {};
    },

    setPopup(value: string): void {
        store.dispatch("SET_POPUP", value);
      },

      async getUserByUsername(username: string): Promise<UserEntity> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/users/other/` + username, {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                Accept: "application/json",
                "Access-Control-Max-Age": "600",
                "Cache-Control": "no-cache",
            },
        });
        if (response.ok)
            return await response.json();
        return {};
    },
    
    async isFriendByUsername(): Promise<boolean> {
        const response = await fetch(`http://${process.env.VUE_APP_ADDRESS}/users/isFriend/` + store.getters.GET_USER_TARGET.username, {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Access-Control-Max-Age": "600",
            "Cache-Control": "no-cache",
          },
        });
        if (response.ok) return await response.json();
        return false;
      }
}