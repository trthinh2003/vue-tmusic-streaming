export default {
    install(app) {
      app.config.globalProperties.$truncateWords = (text, limit = 5, suffix = "...") => {
        if (!text) return "";
        let words = text.split(" ");
        return words.length > limit ? words.slice(0, limit).join(" ") + suffix : text;
      };
    }
  };