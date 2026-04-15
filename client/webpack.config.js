import path from "node:path";
import { fileURLToPath } from "node:url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "assets/[name].[contenthash].js",
    clean: true,
    publicPath: "/"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html")
    })
  ],
  devServer: {
    historyApiFallback: true,
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: "all",
    proxy: [
      {
        context: ["/api", "/health"],
        target: "http://localhost:4000",
        changeOrigin: true
      }
    ],
    client: {
      overlay: true,
      webSocketURL: {
        protocol: "ws",
        hostname: "localhost",
        port: 3000,
        pathname: "/ws"
      }
    }
  }
};
