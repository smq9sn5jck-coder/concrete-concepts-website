const CUSTOMER_WEBSITE_HOSTS = new Set([
  "concreteconceptsgroup.com",
  "www.concreteconceptsgroup.com",
]);

export function isCustomerWebsiteHost(hostname: string) {
  return CUSTOMER_WEBSITE_HOSTS.has(hostname.trim().toLowerCase().replace(/\.+$/, ""));
}
