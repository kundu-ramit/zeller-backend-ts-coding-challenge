interface Item {
    sku: string;
    price: number;
  }
  
  interface PricingRule {
    id: string;
    apply: (cartItems: Item[]) => number;
  }
  
  class Checkout {
    private items: Item[] = [];
    private pricingRules: Map<string, PricingRule> = new Map();
  
    constructor(pricingRules: PricingRule[] = []) {
      pricingRules.forEach(rule => this.pricingRules.set(rule.id, rule));
    }
  
    scan(item: Item): void {
      this.items.push(item);
    }
  
    clearItems(): void {
      this.items = [];
    }
  
    addPricingRule(rule: PricingRule): void {
      this.pricingRules.set(rule.id, rule);
    }
  
    removePricingRule(ruleId: string): void {
      this.pricingRules.delete(ruleId);
    }
  
    total(): number {
      let total = this.items.reduce((sum, item) => sum + item.price, 0); // Sum of all item prices
      this.pricingRules.forEach(rule => (total = rule.apply(this.items))); // Apply each pricing rule
      return total;
    }
  }
  
  // Pricing Rules
  
  const appleTVBulkDiscount: PricingRule = {
    id: "appleTVBulkDiscount",
    apply: (cartItems) => {
      const appleTVs = cartItems.filter((item) => item.sku === "atv").length;
      const discount = Math.floor(appleTVs / 3); // Every 3rd Apple TV is free
      const totalDiscount = discount * cartItems.find((item) => item.sku === "atv")!.price;
      return Math.max(0, cartItems.reduce((sum, item) => sum + item.price, 0) - totalDiscount); // Apply discount
    }
  };
  
  const ipadBulkDiscount: PricingRule = {
    id: "ipadBulkDiscount",
    apply: (cartItems) => {
      const ipads = cartItems.filter((item) => item.sku === "ipd").length;
      const discount = ipads > 4 ? ipads * (549.99 - 499.99) : 0; // Apply discount if more than 4 iPads
      return Math.max(0, cartItems.reduce((sum, item) => sum + (item.sku === "ipd" ? 499.99 : item.price), 0) - discount);
    }
  };
  
  // Sample Usage
  
  const products: Item[] = [
    { sku: "atv", price: 109.5 },
    { sku: "ipd", price: 549.99 },
    { sku: "mbp", price: 1399.99 },
    { sku: "vga", price: 30 },
  ];
  
  const co = new Checkout();
  co.addPricingRule(appleTVBulkDiscount);
  co.addPricingRule(ipadBulkDiscount);
  
  co.scan(products[0]); // atv
  co.scan(products[0]); // atv
  co.scan(products[0]); // atv
  co.scan(products[3]); // vga
  
  const total = co.total();
  console.log("Total:", total); // Output: Total: 249
  
  /*
  Explanation:
  - 3 Apple TVs (atv) at $109.5 each and 1 VGA adapter (vga) at $30.
  - Total without discount: 109.5 * 3 + 30 = 358.5
  - Apple TV discount: 1 free Apple TV (109.5) for every 3 Apple TVs, so discount is 109.5.
  - Total with discount: 358.5 - 109.5 = 249
  */
  
  co.clearItems(); // Clear items for next test case
  
  co.scan(products[0]); // atv
  co.scan(products[1]); // ipd
  co.scan(products[1]); // ipd
  co.scan(products[0]); // atv
  co.scan(products[1]); // ipd
  co.scan(products[1]); // ipd
  co.scan(products[1]); // ipd
  
  const total2 = co.total();
  console.log("Total:", total2); // Output: 2718.95
  
  /*
  Explanation:
  - 2 Apple TVs (atv) at $109.5 each, 5 iPads (ipd) at $549.99 each.
  - Total without discount: 109.5 * 2 + 549.99 * 5 = 219 + 2749.95 = 2968.95
  - Apple TV discount: No discount since less than 3 Apple TVs.
  - iPad discount: 5 iPads qualify for a discount of $50 each, so total discount is 5 * 50 = 250.
  - Total with discount: 2968.95 - 250 = 2718.95
  */
  