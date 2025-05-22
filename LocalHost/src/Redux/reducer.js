import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  wpThemeInfo: "",
  shopifyThemeInfo: "",
  magentoThemeInfo: "",
  moodleThemeInfo: "",
  joomlaThemeInfo: "",
  drupalThemeInfo: "",
  prestaShopThemeInfo: "",
  loading: false,
  loggedIn: false,
  exitModalData: "",
  homePageData: "",

  dnsInfo: "",
  footerContent: "",
  pageData: "",
  inputValue: "",

  googleAdsense: "",
  bannerAds: "",
  textAds: false,
};

export const reducer = createSlice({
  name: "reducer",
  initialState,
  reducers: {
    setWpThemeInfo: (state, action) => {
      state.wpThemeInfo = action.payload;
    },
    setShopifyThemeInfo: (state, action) => {
      state.shopifyThemeInfo = action.payload;
    },
    setMagentoThemeInfo: (state, action) => {
      state.magentoThemeInfo = action.payload;
    },
    setMoodleThemeInfo: (state, action) => {
      state.moodleThemeInfo = action.payload;
    },
    setJoomlaThemeInfo: (state, action) => {
      state.joomlaThemeInfo = action.payload;
    },
    setDrupalThemeInfo: (state, action) => {
      state.drupalThemeInfo = action.payload;
    },
    setPrestaShopThemeInfo: (state, action) => {
      state.prestaShopThemeInfo = action.payload;
    },
    setHomePageData: (state, action) => {
      state.homePageData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setExitModalData: (state, action) => {
      state.exitModalData = action.payload;
    },
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload;
    },

    setFooterContent: (state, action) => {
      state.footerContent = action.payload;
    },

    setPageData: (state, action) => {
      state.pageData = action.payload;
    },

    setInputValue: (state, action) => {
      state.inputValue = action.payload;
    },

    setBannerAds: (state, action) => {
      state.bannerAds = action.payload;
    },
    setGoogleAdsense: (state, action) => {
      state.googleAdsense = action.payload;
    },
    setTextAds: (state, action) => {
      state.textAds = action.payload;
    },
  },
});

export const {
  setLoading,
  setLoggedIn,
  setExitModalData,
  setFooterContent,
  setPageData,
  setInputValue,
  setGoogleAdsense,
  setBannerAds,
  setTextAds,
  setWpThemeInfo,
  setHomePageData,
  setShopifyThemeInfo,
  setMagentoThemeInfo,
  setMoodleThemeInfo,
  setJoomlaThemeInfo,
  setDrupalThemeInfo,
  setPrestaShopThemeInfo,
} = reducer.actions;
export default reducer.reducer;
