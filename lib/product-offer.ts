export function buildProductOffer(
  product: { priceVnd?: number | null; status: string },
  productUrl: string,
  sellerName: string
) {
  const price = product.priceVnd;
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return undefined;
  }

  return {
    "@type": "Offer",
    url: productUrl,
    priceCurrency: "VND",
    price,
    availability: product.status === "AVAILABLE"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    areaServed: { "@type": "City", name: "Đà Nẵng" },
    seller: { "@type": "Organization", name: sellerName },
  };
}
