export const getNotifications = () => {
    try {
     
      return JSON.parse(localStorage.getItem("notifications") || "[]");
    } catch (error) {
      console.error("Error parsing notifications:", error);
      return [];
    }
  };
  
  export const saveNotification = (notification) => {
    const notifications = getNotifications();
    notifications.push(notification);
    localStorage.setItem("notifications", JSON.stringify(notifications));
  };