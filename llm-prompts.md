# LLM Prompts and Attribution

This document contains all ChatGPT and Codex prompts used for this project.

Inspiration for the technical design also came from an open source project I created called [Idiom Search](https://github.com/Fresbee/idiom-search). This project utilizes a similar technology stack useful for this project. Permission is granted to use all source code under the MIT license.

## LLM Prompts

I am building a food recipe management system. To begin, please review the README.md in this repository. My initial goal is to create a RESTful API. I attached an OpenAPI specification along with the JSON data format I would like in MongoDB. What are your initial thoughts before implementing any code changes?

Q: How should recipes be uniquely identified? Use 'title' (may not be unique) or add MongoDB ObjectId? Current API uses title in paths.
A: Add MongoDB ObjectId
Q: Add missing endpoints: POST /recipes (create), GET /recipe/{name} (single), POST /auth/logout? These are in README use cases.
A: Add all of these missing endpoints
Q: What should the PUT /recipe/{name} request body contain? Full recipe object or partial updates?
A: Full recipe object
Q: Should 'organization' be required in RegisterRequest, or assign default organization?
A: Organization is required for RegisterRequest
Q: Change LoginRequest 'username' to 'email' for consistency with data-format.md?
A: Change LoginRequest to 'email'

Start Implementation

---

I would like to insert some records into a MongoDB 'recipes' collection I have defined. I referenced the model that is used by MongoDB in /models/recipe.py. Would you be able to make a MongoDB query to insert the following JSON object into this recipes collection?

Here is a data model that I use in my project with beanie and Pymongo:

from beanie import Document
from pydantic import Field
from typing import List

class Ingredient(Document):
    """
    Defines a food ingredient and its quantity
    """

    name: str = Field(..., description="Ingredient name and details")
    quantity: str = Field(..., description="Quantity and unit")

class Recipe(Document):
    """
    Defines a recipe representing everything needed to prepare a food dish
    """

    organization: str = Field(..., description="Organization that owns this recipe")
    title: str = Field(..., description="Recipe title")
    yieldAmount: int = Field(..., description="Number of servings")
    tags: List[str] = Field(default_factory=list, description="Recipe tags")
    ingredients: List[Ingredient] = Field(..., description="List of ingredients")
    instructions: List[str] = Field(..., description="Step-by-step instructions")

    class Config:
        json_schema_extra = {
            "description": "A Recipe represents everything needed to prepare a food dish"
        }

Here is a sample recipe:
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

---

I have a recipe with the title "Chicken Marsala" in the recipes MongoDB collection. Although I can find this record from the mongosh shell, I cannot find it using the `get_recipe()` function in routes/recipe.py. What could be causing the method to return 404 Not Found instead of the expected 200 OK?

ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "/usr/local/lib/python3.13/site-packages/uvicorn/protocols/http/httptools_impl.py", line 426, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        self.scope, self.receive, self.send
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "/usr/local/lib/python3.13/site-packages/uvicorn/middleware/proxy_headers.py", line 84, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/fastapi/applications.py", line 1139, in __call__
    await super().__call__(scope, receive, send)
  File "/usr/local/lib/python3.13/site-packages/starlette/applications.py", line 107, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/usr/local/lib/python3.13/site-packages/starlette/middleware/errors.py", line 186, in __call__
    raise exc
  File "/usr/local/lib/python3.13/site-packages/starlette/middleware/errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "/usr/local/lib/python3.13/site-packages/starlette/middleware/exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "/usr/local/lib/python3.13/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "/usr/local/lib/python3.13/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "/usr/local/lib/python3.13/site-packages/fastapi/middleware/asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "/usr/local/lib/python3.13/site-packages/starlette/routing.py", line 716, in __call__
    await self.middleware_stack(scope, receive, send)
  File "/usr/local/lib/python3.13/site-packages/starlette/routing.py", line 736, in app
    await route.handle(scope, receive, send)
  File "/usr/local/lib/python3.13/site-packages/starlette/routing.py", line 290, in handle
    await self.app(scope, receive, send)
  File "/usr/local/lib/python3.13/site-packages/fastapi/routing.py", line 120, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "/usr/local/lib/python3.13/site-packages/starlette/_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "/usr/local/lib/python3.13/site-packages/starlette/_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "/usr/local/lib/python3.13/site-packages/fastapi/routing.py", line 106, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/fastapi/routing.py", line 430, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    ...<3 lines>...
    )
    ^
  File "/usr/local/lib/python3.13/site-packages/fastapi/routing.py", line 316, in run_endpoint_function
    return await dependant.call(**values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/code/api/routes/recipe.py", line 23, in get_recipe
    results = await cursor.to_list(length=limit)
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/queries/cursor.py", line 75, in to_list
    parse_obj(projection, i, lazy_parse=self.lazy_parse)
    ~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/utils/parsing.py", line 146, in parse_obj
    result = parse_model(model, data)
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/utils/pydantic.py", line 42, in parse_model
    return model_type.model_validate(data)
           ~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^
  File "/usr/local/lib/python3.13/site-packages/pydantic/main.py", line 716, in model_validate
    return cls.__pydantic_validator__.validate_python(
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^
        obj,
        ^^^^
    ...<5 lines>...
        by_name=by_name,
        ^^^^^^^^^^^^^^^^
    )
    ^
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/documents.py", line 208, in __init__
    super(Document, self).__init__(*args, **kwargs)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/pydantic/main.py", line 250, in __init__
    validated_self = self.__pydantic_validator__.validate_python(data, self_instance=self)
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/documents.py", line 209, in __init__
    self.get_pymongo_collection()
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~^^
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/interfaces/getters.py", line 16, in get_pymongo_collection
    return cls.get_settings().pymongo_collection
           ~~~~~~~~~~~~~~~~^^
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/documents.py", line 1110, in get_settings
    raise CollectionWasNotInitialized
beanie.exceptions.CollectionWasNotInitialized

---

This solved the issue. Next I only want to return recipes that match the organization of the logged in user. The TODO comment in routes/recipe.py is where I envisioned narrowing the returned results. Would you be able to make this change?

---

Next I would like to add an edit endpoint called PUT /recipe/{title}. It allows a user to update the contents of a recipe within their organization as long as the full title is an exact match. This would live in the /routes/recipe.py file. What do you recommend to ensure we only modify one recipe in this endpoint?

For ease of use, the logged in user already has the organization. We can use user.organization for that. Would you be able to modify models/recipe.py to have a compound index like you described? And would you modify routes/recipe.py to have a corresponding implementation?

---

I see a type mismatch in the update_recipe() function in routes/recipes.py. The MongoDB data model has ingredients: List[Ingredient], but the schemas/recipe.py has ingredients: list[dict]. How can this type mismatch be resolved? I would like to preserve the MongoDB model as-is.

---

I would also like to add a DELETE /recipe/{title} endpoint. Similarly, a user can only delete a recipe that belongs to the same organization as them. Please modify the code in routes/recipe.py to make this addition.

---

Would you be able to tweak the delete_recipe() method to return an HTTP 500-series error is the document.delete() fails to work?

---

I would like to create a POST /recipe/{title} endpoint. Using the stub I provided, please provide an implementation for it.

---

How can we enforce required fields on the Recipe schema? This is important for the POST and PUT methods for their post body content. Please make this refactor for me.

---

In order to exercise this API, would you be able to generate some automated tests? The goal is check for HTTP status codes and responses for the inputs. Focus on the /recipe endpoints, since authentication has been tested in other ways. The Python unittest framework seems like a good basis for this.

---

I am building a food recipe management app. One of my endpoints uploads recipe data in the format of this example:

{
    "title": "Chicken Marsala",
    "yieldAmount": 4,
    "ingredients": [
        { "name": "all-purpose flour (for coating)", "quantity": "1/4 cup" },
        { "name": "salt", "quantity": "1/2 tsp" },
        { "name": "ground black pepper", "quantity": "1/4 tsp" },
        { "name": "dried oregano", "quantity": "1/2 tsp" },
        { "name": "medium skinless, boneless chicken breast halves", "quantity": "4" },
        { "name": "butter", "quantity": "4 tbsp" },
        { "name": "olive oil", "quantity": "4 tbsp" },
        { "name": "sliced mushrooms", "quantity": "1 cup" },
        { "name": "Marsala wine", "quantity": "1/2 cup" },
        { "name": "Sherry wine", "quantity": "1/4 cup" }
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

Would you be able to generate 30 different recipes with this format and output them into a JSON file? I would like you to make more realistic recipes with actual named dishes and varied ingredients. Tailor them to Italian cuisine please.

---

For the next level of realism, please fully customize each recipe with authentic, unique ingredients (not templated). Please include corresponding instructions for each recipe.

---

Looking at the current FastAPI endpoints, please suggest any edge cases that should be addressed.

---

Good findings. Would you be able to patch the following:
Recipe titles in the path will break for some valid real-world titles. A title containing / cannot be addressed cleanly as /recipe/{title}, and titles with only whitespace or very long values are currently accepted because the path parameter has no extra validation. This affects create, update, delete, and search. --> Reject strings with only whitespace or strings with a title > 100 characters.

Several fields allow technically valid but useless data. organization, password, ingredient name, ingredient quantity, and instruction strings can all be empty/blank strings, so you can create accounts and recipes that pass validation but are effectively malformed. --> Reject empty/blank strings for these fields.

Search has a couple of tricky cases. /recipe/{search_phrase} uses a case-insensitive .*phrase.* regex, which can become a collection scan for common phrases and may return large ambiguous result sets with no stable sort. Also, “no matches” returns 404 instead of 200 [], which may make client search UX awkward. --> Return 200 OK [] when no results are located for a search phrase.

Next, please fix the following:

Duplicate user creation under race conditions is still possible. register() only does a pre-check with find_one() and then inserts, but the users model does not define a unique email index, so two concurrent requests can create the same account. --> Make the email field a unique constraint in the User collection

Auth behavior is inconsistent for browser clients. login() sets access_token and refresh_token cookies, but protected endpoints only read the Authorization header via HTTPBearer, not the cookie, so a browser session with cookies alone still cannot call /recipe/*. register() also returns tokens but does not set cookies at all. --> leverage browser session cookies for the GET, POST, PUT, and DELETE endpoints

---

I see this error message when starting the api container service. It may have to do with the existing index approach I had before your recent changes:

ERROR:    Application startup failed. Exiting.
INFO:     Started server process [1]
INFO:     Waiting for application startup.
Initializing database connection...
ERROR:    Traceback (most recent call last):
  File "/usr/local/lib/python3.13/site-packages/starlette/routing.py", line 694, in lifespan
    async with self.lifespan_context(app) as maybe_state:
               ~~~~~~~~~~~~~~~~~~~~~^^^^^
  File "/usr/local/lib/python3.13/contextlib.py", line 214, in __aenter__
    return await anext(self.gen)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/fastapi/routing.py", line 206, in merged_lifespan
    async with original_context(app) as maybe_original_state:
               ~~~~~~~~~~~~~~~~^^^^^
  File "/usr/local/lib/python3.13/contextlib.py", line 214, in __aenter__
    return await anext(self.gen)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/fastapi/routing.py", line 206, in merged_lifespan
    async with original_context(app) as maybe_original_state:
               ~~~~~~~~~~~~~~~~^^^^^
  File "/usr/local/lib/python3.13/contextlib.py", line 214, in __aenter__
    return await anext(self.gen)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/code/api/main.py", line 12, in lifespan
    await init_db()
  File "/code/api/core/database.py", line 15, in init_db
    await init_beanie(
    ...<6 lines>...
    )
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/utils/init.py", line 780, in init_beanie
    await Initializer(
    ...<6 lines>...
    )
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/utils/init.py", line 131, in __await__
    yield from self.init_class(model).__await__()
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/utils/init.py", line 743, in init_class
    await self.init_document(cls)
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/utils/init.py", line 607, in init_document
    await self.init_indexes(cls, self.allow_index_dropping)
  File "/usr/local/lib/python3.13/site-packages/beanie/odm/utils/init.py", line 559, in init_indexes
    new_indexes += await collection.create_indexes(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        IndexModelField.list_to_index_model(new_indexes)
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "/usr/local/lib/python3.13/site-packages/pymongo/asynchronous/collection.py", line 2227, in create_indexes
    return await self._create_indexes(indexes, session, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/pymongo/_csot.py", line 115, in csot_wrapper
    return await func(self, *args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/pymongo/asynchronous/collection.py", line 2264, in _create_indexes
    await self._command(
    ...<6 lines>...
    )
  File "/usr/local/lib/python3.13/site-packages/pymongo/asynchronous/collection.py", line 620, in _command
    return await conn.command(
           ^^^^^^^^^^^^^^^^^^^
    ...<14 lines>...
    )
    ^
  File "/usr/local/lib/python3.13/site-packages/pymongo/asynchronous/helpers.py", line 47, in inner
    return await func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/pymongo/asynchronous/pool.py", line 398, in command
    return await command(
           ^^^^^^^^^^^^^^
    ...<22 lines>...
    )
    ^
  File "/usr/local/lib/python3.13/site-packages/pymongo/asynchronous/network.py", line 212, in command
    helpers_shared._check_command_response(
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^
        response_doc,
        ^^^^^^^^^^^^^
    ...<2 lines>...
        parse_write_concern_error=parse_write_concern_error,
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    )
    ^
  File "/usr/local/lib/python3.13/site-packages/pymongo/helpers_shared.py", line 284, in _check_command_response
    raise OperationFailure(errmsg, code, response, max_wire_version)
pymongo.errors.OperationFailure: An existing index has the same name as the requested index. When index names are not specified, they are auto generated and can cause conflicts. Please refer to our documentation. Requested index: { v: 2, unique: true, key: { email: 1 }, name: "email_1" }, existing index: { v: 2, key: { email: 1 }, name: "email_1" }, full error: {'ok': 0.0, 'errmsg': 'An existing index has the same name as the requested index. When index names are not specified, they are auto generated and can cause conflicts. Please refer to our documentation. Requested index: { v: 2, unique: true, key: { email: 1 }, name: "email_1" }, existing index: { v: 2, key: { email: 1 }, name: "email_1" }', 'code': 86, 'codeName': 'IndexKeySpecsConflict'}

---

Next I see an unexpected error here:

RROR:    Application startup failed. Exiting.
INFO:     Started server process [1]
INFO:     Waiting for application startup.
Initializing database connection...
ERROR:    Traceback (most recent call last):
  File "/usr/local/lib/python3.13/site-packages/starlette/routing.py", line 694, in lifespan
    async with self.lifespan_context(app) as maybe_state:
               ~~~~~~~~~~~~~~~~~~~~~^^^^^
  File "/usr/local/lib/python3.13/contextlib.py", line 214, in __aenter__
    return await anext(self.gen)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/fastapi/routing.py", line 206, in merged_lifespan
    async with original_context(app) as maybe_original_state:
               ~~~~~~~~~~~~~~~~^^^^^
  File "/usr/local/lib/python3.13/contextlib.py", line 214, in __aenter__
    return await anext(self.gen)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/usr/local/lib/python3.13/site-packages/fastapi/routing.py", line 206, in merged_lifespan
    async with original_context(app) as maybe_original_state:
               ~~~~~~~~~~~~~~~~^^^^^
  File "/usr/local/lib/python3.13/contextlib.py", line 214, in __aenter__
    return await anext(self.gen)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/code/api/main.py", line 12, in lifespan
    await init_db()
  File "/code/api/core/database.py", line 15, in init_db
    await ensure_user_email_unique_index(client[settings.mongodb_db])
  File "/code/api/core/database.py", line 56, in ensure_user_email_unique_index
    duplicates = await duplicate_cursor.to_list(length=1)
                       ^^^^^^^^^^^^^^^^^^^^^^^^
AttributeError: 'coroutine' object has no attribute 'to_list'

/usr/local/lib/python3.13/site-packages/uvicorn/lifespan/on.py:91: RuntimeWarning: coroutine 'AsyncCollection.aggregate' was never awaited
  return
RuntimeWarning: Enable tracemalloc to get the object allocation traceback
ERROR:    Application startup failed. Exiting.

---

I would like to build a Next.js and Tailwind CSS front-end web application using the API. I created a directory called web which houses a Dockerfile. The docker-compose.yaml file will start up the service. Please do the following:

1. Create a new Next.js + Tailwind CSS project in the web directory.
2. Create a login page that has the title text "Menu Master", a field for email address, a field for password, and a login button. A successful login (with the POST /auth/login endpoint) will navigate to a new page that says "Landing Page". An auth cookie shall be stored, so the Recipe endpoints can be later integrated.
3. The Landing Page shall have a logout button in the upper-right corner. Clicking this button shall close the existing session and tear down the auth cookie.

---

I would like you to add a search bar to the top of the Landing Page page with a "Search" button to the right of it. When a user clicks the "Search" button, this invokes the GET /recipe/{search_phrase} endpoint. Please display the titles of all matching search results below the search bar.

---

Please update the /landing page.tsx to support vertical scrolling if there are more search results than the vertical area of the page.

---

Next I would like you to split the horizontal area of the white rectangle into two sections. In the left section, move the SEARCH RESULTS component. In the right section, create an empty panel. This empty panel shall be populated when the user clicks on any of the search results. Clicking a recipe in the search results shall display the following information already retrieved via the GET /recipe/{search_phrase} endpoint:

* recipe title
* yield (Displayed as "Yields N servings", where N is the yield integer value)
* ingredients (the measurement quantity followed by the ingredient name)
* step-by-step instructions (numbered as 1., 2., 3., etc.) 

---

Next I would like to add an "Edit" button in the upper right corner of the recipe display pane. When the user clicks "Edit", they will be able to modify the following:

* recipe title (string)
* integer number for the yield
* add a new ingredient, edit existing ingredients, or remove ingredients
* add a new instruction step, edit existing instruction steps, or remove an instruction step

The PUT /recipe/{title} endpoint shall be used to save the updated recipe.

---

I would like to add a "Delete" button to the right of the "Edit" button in the display pane. The "Delete" button should be less prominent by having the same background color as preview pane area.

When clicking the "Delete" button, a modal appears. The modal says "Are you sure you would like to delete this recipe? This action cannot be reversed." If they click "Yes", the DELETE /recipe/{title} endpoint is invoked and deletes the recipe from the database. The modal is dismissed. If they click "No", the modal is only dismissed. 

---

Please add the logged in user's email address to the left of the "Logout" button on the /landing page. This shows who is logged in.

Please remove the oval border around the sessionUser.email on the landing page. Change the sessionUser's email to just be plain text.

---

Please find any edge cases for authentication and session management. Plan but do not implement ways to improve this.

---

Please add automatic refresh handling in the web tier. 
Create a server-side refresh utility that retries protected API calls once on 401, calls /auth/refresh, updates cookies, and then replays the original request. I have a POST /auth/refresh endpoint, but this needs to be integrated into the web tier.