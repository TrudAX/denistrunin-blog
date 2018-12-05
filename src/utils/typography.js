import Typography from "typography";
import Bootstrap from "typography-theme-bootstrap";
import Github from "typography-theme-github";

Bootstrap.overrideThemeStyles = () => ({
  "a.gatsby-resp-image-link": {
    boxShadow: "none"
  }
});

Bootstrap.scaleRatio = 1.75;

//const typography = new Typography(Bootstrap);
const typography = new Typography(Github);
const { rhythm, scale } = typography;
export { rhythm, scale, typography as default };

// Hot reload typography in development.
if (process.env.NODE_ENV !== "production") {
  typography.injectStyles();
}
