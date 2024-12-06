import { fetchy } from "@/utils/fetchy";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUsername = ref("");
    const currentlyViewingCareboard = ref("");
    const sisterCircleOptIn = ref(true);
    const myCareBoardOptIn = ref(true);

    const isLoggedIn = computed(() => currentUsername.value !== "");

    const resetStore = () => {
      currentUsername.value = "";
      currentlyViewingCareboard.value = "";
      sisterCircleOptIn.value = true;
      myCareBoardOptIn.value = true;
    };

    const createUser = async (username: string, password: string) => {
      await fetchy("/api/users", "POST", {
        body: { username, password },
      });
      const userInfo = await fetchy(`api/users/${username}`, "GET");
      const userId = userInfo._id;
      await fetchy(`/api/opting/${userId}`, "POST");
    };

    const loginUser = async (username: string, password: string) => {
      await fetchy("/api/login", "POST", {
        body: { username, password },
      });
    };

    const updateSession = async () => {
      try {
        const { username } = await fetchy("/api/session", "GET", { alert: false });
        currentUsername.value = username;
      } catch {
        currentUsername.value = "";
      }
    };

    const fetchOptingStatus = async () => {
      try {
        const userName = currentUsername.value;
        const userInfo = await fetchy(`api/users/${userName}`, "GET");
        const userId = userInfo._id;
        const response = await fetchy(`/api/opting/${userId}`, "GET");
        sisterCircleOptIn.value = response.sisterCircle;
        myCareBoardOptIn.value = response.myCareBoard;
      } catch (error) {
        console.error("Failed to fetch opting status:", error);
      }
    };

    const updateOptingStatus = async (feature: "sisterCircle" | "myCareBoard", status: boolean) => {
      try {
        const userName = currentUsername.value;
        const userInfo = await fetchy(`api/users/${userName}`, "GET");
        const userId = userInfo._id;
        await fetchy(`/api/opting/${userId}`, "PATCH", { body: { feature, status } });
        if (feature === "sisterCircle") {
          sisterCircleOptIn.value = status;
        } else {
          myCareBoardOptIn.value = status;
        }
      } catch (error) {
        console.error("Failed to update opting status:", error);
      }
    };

    const goToCareboard = async (visitingUsername: string) => {
      currentlyViewingCareboard.value = visitingUsername;
    };

    const logoutUser = async () => {
      await fetchy("/api/logout", "POST");
      resetStore();
    };

    const updateUserUsername = async (username: string) => {
      await fetchy("/api/users/username", "PATCH", { body: { username } });
    };

    const updateUserPassword = async (currentPassword: string, newPassword: string) => {
      await fetchy("/api/users/password", "PATCH", { body: { currentPassword, newPassword } });
    };

    const deleteUser = async () => {
      await fetchy("/api/users", "DELETE");
      resetStore();
    };

    return {
      currentUsername,
      isLoggedIn,
      createUser,
      loginUser,
      updateSession,
      logoutUser,
      updateUserUsername,
      updateUserPassword,
      deleteUser,
      currentlyViewingCareboard,
      goToCareboard,
      sisterCircleOptIn,
      myCareBoardOptIn,
      fetchOptingStatus,
      updateOptingStatus,
    };
  },
  { persist: true },
);
