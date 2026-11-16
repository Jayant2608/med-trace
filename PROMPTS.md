# Medicine Traceability System: Prompts Used

These are the prompts given to Claude (Anthropic) while building this DBMS project, in order. They are kept word for word, including spelling mistakes.

> Note: Prompt 2 also included the ER diagram image. Save it in this repository (for example `er-diagram.png`) and link it here: `![ER diagram](er-diagram.png)`

---

## Prompt 1: Project explanation and project statement

### The Medicine Traceability System, in Simple Words

#### The big idea

Fake and expired medicines are a real danger. This system tracks every batch of medicine from the factory to the customer, so that if something goes wrong, you can quickly find out *where that batch went and who bought it*, and stop further sales.

Think of it like a parcel tracking system, but for medicines, with extra safety checks.

#### The main characters (core tables)

*1. ORGANIZATIONS.* Everyone who handles medicine: manufacturers, distributors, pharmacies, and regulators (government bodies). They are kept in one table, and the org_type column says which kind each one is.

*2. MEDICINES.* The product catalogue: name, composition, strength, and who makes it. Example: "Paracetamol 500mg".

*3. BATCHES.* The heart of the system. A medicine is produced in batches, and each batch has a manufacturing date, expiry date, quantity, and a unique batch_code printed on the strip. Its *status* is either genuine, recalled, suspected_fake, or expired, and this status decides whether the batch can be sold.

Relationships: One organization manufactures many medicines. One medicine has many batches.

#### How medicine moves (movement tables)

*4. SHIPMENTS.* A record of one organization sending stock to another (for example, manufacturer to distributor), with ship and receive dates.

*5. SHIPMENT_ITEMS.* One shipment can carry many batches, and one batch can travel in many shipments. This table lists which batches and how many are in each shipment.

*6. INVENTORY.* Shows how much of each batch an organization currently has in stock. A pharmacy might hold 200 strips of batch X.

#### How medicine reaches customers (sales tables)

*7. CUSTOMERS.* Buyer details: name, phone, email.

*8. SALES.* A pharmacy sells to a customer. This is the bill: date and total amount.

*9. SALE_ITEMS.* The lines on the bill: which batches were sold, how many, at what price.

#### Safety tables

*10. RECALLS.* When a regulator finds a problem, it recalls a batch, with the reason, severity, and date.

*11. VERIFICATION_SCANS.* A customer types the batch code from the strip to check it. The system replies genuine, recalled, expired, or unknown. If the code doesn't exist, the batch is stored as null and the result is "unknown", which is a hint that the medicine may be fake.

*12. AUDIT_LOG.* A history of every status change of a batch: old status, new status, who changed it, when, and why. It makes the system accountable.

#### Why the junction tables exist

Shipment_Items, Sale_Items and Inventory exist because of *many-to-many* relationships. A shipment has many batches, and a batch appears in many shipments. A database can't store that directly, so a middle table is added. Its key is a *composite key*, such as (shipment_id, batch_id).

#### The full journey (the story to tell)

1. A *manufacturer* produces a *batch* of a *medicine*.
2. The batch is sent via a *shipment* to a distributor, then to a pharmacy. Each step is recorded in shipments and inventory.
3. A pharmacy makes a *sale* to a *customer*, and the batch appears in sale items.
4. If the batch turns out to be bad, the *regulator* issues a *recall, and the batch status changes. The change is saved in the **audit log*.
5. Any customer can *scan* the batch code to verify it.

#### How it achieves the project goals

- *Forward tracing:* start from one batch and follow it through shipments, inventory, sales, and finally to the customers who bought it. This shows exactly who is affected by a recall.
- *Blocking bad sales:* a trigger (an automatic rule) on Sale_Items checks the batch status and expiry date, and rejects the sale if the batch is recalled, fake, or expired.
- *Audit trail:* another trigger writes to the Audit_Log whenever a batch status changes.
- *Customer verification:* the scan looks up batch_code and returns the result.

#### Quick notation recap

- *PK* (primary key): unique ID of a row, like batch_id.
- *FK* (foreign key): a link to another table's PK.
- *UK* (unique key): no duplicates allowed, like batch_code.
- *1 / N*: one-to-many. One medicine has many batches, but each batch belongs to one medicine.

#### One-line summary you can say

"This database follows every medicine batch from manufacturer to customer, blocks the sale of recalled, fake, or expired batches automatically, keeps a log of every status change, and lets customers verify a medicine using its batch code."

#### Project statement

"The system doesn't prevent every bad batch from existing, because many problems happen outside our control: a manufacturing defect, heat damage during transport, or a counterfeit strip copied with a real batch code. What the system does is make sure that once a problem is discovered, the batch is stopped immediately, everyone who received it can be traced, and customers can verify it themselves."

Problems with medicines can happen anywhere in the supply chain, outside our control. Our system's job is to catch them fast, stop further sales, and trace everyone affected

---

## Prompt 2: Build the website from the ER diagram

(The same project explanation and statement as above, plus the ER diagram image, followed by:)

> THIS OUR OUR DATABASE MANAGEMENT PROJECT ALONG WITH THE ER DIAGRAM GIVEN FOR MAKING DATABSE CREATE ME A WEBSITE HAVING  A LOGIN PAGE WHERE A PERSON CAN FILL HIS DETAILS AND ACCESS THE DIFFERENT DATA SETS I.E ORAGNISATIONS WHO MAKE MEDICINES YOU CAN TAKE ALL THE DATASETS ACCORDINGLY AS YOUR WISH   CREATE ME A DECENT WEBSITE

---

## Prompt 3: Get a link

> GIVE ME A LINK  TO ACCESS THE WEBSITE

---

## Prompt 4: Custom-style link

> https://dbms-project-production-0729.up.railway.app/ IS THE WEBSITE OF ANOTHER PROJECT MADE BY MY FRIEND USING UR HELP ONLY GIVE A LINK LIKE THIS I.E IT SHOULD CONTAIN NAME OF MY WEBSITE AND WHAT IT DOES I.E MEDICINE TRACABILTY

---

## Prompt 5: Choose the Netlify method

> 2ND METHOD

---

## Prompt 6: Download the files

> give me the downloadable files

---

## Prompt 7: Save the prompts for GitHub

> pack me the prompts i gave u earlier regarding our project i want to add it to github
