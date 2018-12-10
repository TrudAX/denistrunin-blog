module.exports = {
  siteMetadata: {
    title: "Denis Trunin's X++ Programming Blog",
    author: "Denis Trunin",
    description:
      "Blog about Microsoft Dynamics 365 for Finance and Operations X++ programming, tools, hints and more.",
    siteUrl: "https://denistrunin.netlify.com/"
  },
  pathPrefix: "/",
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: "pages"
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/posts`,
        name: "posts"
      }
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 700,
              backgroundColor: "transparent"
            }
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`
            }
          },
          "gatsby-remark-prismjs",
          "gatsby-remark-copy-linked-files"
        ]
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-130530770-1`,
        anonymize: true
      }
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
        {
          site {
            siteMetadata {
              title
              description
              siteUrl
              site_url: siteUrl
            }
          }
        }
      `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.frontmatter.excerpt,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  
                  custom_elements: [
                    { "content:encoded": edge.node.html }
                  ]
                });
              });
            },
            query: `
            {
              allMarkdownRemark(
                sort: { order: DESC, fields: [frontmatter___date] },
              ) {
                edges {
                  node {
                    html
                    fields { slug }
                    frontmatter {
                      excerpt
                      title
                      date
                      featuredImage {
                        childImageSharp {
                            fluid(maxWidth: 1000) {
                                originalImg
                            }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          output: "/rss.xml",
          title: "Gatsby RSS Feed"
          }
        ]
      }
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sass`,
    {
      resolve: "gatsby-plugin-typography",
      options: {
        pathToConfigModule: "src/utils/typography"
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "Denis Trunin's X++ Programming Blog",
        short_name: "DT Blog",
        start_url: "https://denistrunin.netlify.com",
        background_color: "#fff",
        theme_color: "#007acc",
        display: "minimal-ui",
        icons: [
          {
            src: `/favicons/favicon.png`,
            sizes: `64x64`,
            type: `image/png`
          },
          {
            src: `/favicons/640x640.png`,
            sizes: `640x640`,
            type: `image/png`
          }
        ]
      }
    },
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://denistrunin.netlify.com`
      }
    },
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-offline`,
    `gatsby-plugin-netlify`
  ]
};