import { defineAdminExtensions } from "@medusajs/admin-sdk"

console.log("SendCloud admin extensions loading...");

const adminExtensions = defineAdminExtensions({
  routes: [
    {
      path: "/sendcloud", 
      file: "./routes/sendcloud/page"
    }
  ]
})

export default adminExtensions
