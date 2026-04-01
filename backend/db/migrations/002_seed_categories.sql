-- Seed categories table with default expense categories
INSERT INTO categories (name) VALUES
    ('Food & Groceries'),
    ('Dining Out'),
    ('Transportation'),
    ('Fuel'),
    ('Shopping'),
    ('Clothing & Fashion'),
    ('Electronics'),
    ('Home & Furniture'),
    ('Utilities'),
    ('Rent / Housing'),
    ('Health & Pharmacy'),
    ('Personal Care'),
    ('Fitness & Gym'),
    ('Entertainment'),
    ('Subscriptions'),
    ('Travel'),
    ('Education'),
    ('Financial (Bills, Taxes, Insurance, Fees)'),
    ('Gifts & Donations'),
    ('Miscellaneous')
ON CONFLICT (name) DO NOTHING;
