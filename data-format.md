# Data Format

This file describes the data format represented in the database. Records are JSON formatted, since they lend to easy CRUD actions.

## Recipes

Here is an example of a Recipe record. The organization field is important, since CRUD actions are only available on the recipes that belong to the same organization as the logged in user.

```json
{
    "organization": "Tuscan Dreams",
    "title": "Chicken Marsala",
    "yieldAmount": 4,
    "ingredients": [
        { "name": "all-purpose flour (for coating)", "quantity": "1/4 cup"},
        { "name": "salt", "quantity": "1/2 tsp"},
        { "name": "ground black pepper", "quantity": "1/4 tsp"},
        { "name": "dried oregano", "quantity": "1/2 tsp"},
        { "name": "medium skinless, boneless chicken breast halves", "quantity": "4"},
        { "name": "butter", "quantity": "4 tbsp"},
        { "name": "olive oil", "quantity": "4 tbsp"},
        { "name": "sliced mushrooms", "quantity": "1 cup"},
        { "name": "Marsala wine", "quantity": "1/2 cup"},
        { "name": "Sherry wine", "quantity": "1/4 cup"}
    ],
    "instructions": [
        "Gather all ingredients.",
        "In a shallow dish or bowl, mix together the flour, salt, pepper and oregano.",
        "Coat chicken pieces in flour mixture.",
        "In a large skillet, melt butter in olive oil over medium heat. Place chicken in the pan, and lightly brown.",
        "Turn over chicken pieces, and add mushrooms. Pour in wine and sherry.",
        "Cover skillet; simmer chicken 10 minutes, turning once, until no longer pink and juices run clear.",
        "Serve hot and enjoy!"
    ]
}
```

## Users

Here is an example of a User record. This is important for authentication into the system.

```json
{
    "email": "john.doe@tuscandreams.biz",
    "password": "hashed_password_data",
    "organization": "Tuscan Dreams"
}
```
