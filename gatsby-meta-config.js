/**
 * @typedef {Object} Links
 * @prop {string} github Your github repository
 */

/**
 * @typedef {Object} MetaConfig
 * @prop {string} title Your website title
 * @prop {string} description Your website description
 * @prop {string} author Maybe your name
 * @prop {string} siteUrl Your website URL
 * @prop {string} lang Your website Language
 * @prop {string} utterances Github repository to store comments
 * @prop {Links} links
 * @prop {string} favicon Favicon Path
 */

/** @type {MetaConfig} */
const metaConfig = {
  title: "JUNGWOO DEV LOUNGE", // 상단 블로그 제목
  description: `JUNGWOO DEV LOUNGE`,
  author: "Jungwoo",
  siteUrl: "https://jungwoo3490.github.io",
  lang: "en",
  utterances: "jungwoo3490/blog-comment",
  links: {
    github: "https://github.com/jungwoo3490",
  },
  favicon: "src/images/icon.png",
}

// eslint-disable-next-line no-undef
module.exports = metaConfig
