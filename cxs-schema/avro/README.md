# cxs-utils Schema in Avro format

## SemanticEvent Schema

The `SemanticEvent` schema is a central schema that aggregates various pieces of contextual information related to an event. It serves as a comprehensive data structure for capturing a wide range of event-related details.

### Structure

The `SemanticEvent` schema is defined in `semantic_event.avsc` and has the following key characteristics:

- It includes core event properties like `event_gid`, `type`, `event`, `timestamp`, `message_id`, and `entity_gid` directly at the root level. These fields mirror the data in `BaseEventInfo` and are provided for convenience.
- It also includes a `base_event_info` field, which contains the complete `BaseEventInfo` record, ensuring all original base event data is preserved and accessible.
- It incorporates various other schemas as nested fields. These nested schemas represent specific aspects of the event context, such as `AccessInfo`, `App`, `Campaign`, `Commerce`, `Content`, `Context`, `Device`, `Entity`, `Media`, `Page`, `Product`, `Referrer`, `Screen`, `SemanticEventClassification`, `SemanticEventLocation`, `Sentiment`, `SourceInfo`, `UserAgent`, and more.
- Most of these nested schemas are defined as arrays, allowing for multiple instances of each type (e.g., an event might have multiple classifications or involve multiple products).
- These nested fields are optional and default to `null` if not applicable to a particular event.

### Purpose

The primary purpose of the `SemanticEvent` schema is to provide a unified and extensible way to represent complex events with rich contextual data. By combining various specialized schemas, it allows for flexibility in capturing diverse event types and their associated attributes.

## Developer Guidance

This section provides guidance for developers working with Avro schemas in the `cxs-utils` project.

### Defining New Schemas

-   **Namespace:** All schemas should belong to the `com.contextsuite.schema` namespace.
-   **File Naming:** Schema files should be named descriptively using snake_case (e.g., `my_new_schema.avsc`).
-   **Record Types:** Define data structures as `record` types.
-   **Fields:**
    -   Use clear and descriptive names for fields.
    -   Provide a `doc` attribute for each field to explain its purpose.
    -   Specify appropriate Avro data types. For optional fields, use a union with `null` (e.g., `["null", "string"]`) and provide a `default: null` value.
    -   For fields that reference other schemas, use the fully qualified name of the schema (e.g., `com.contextsuite.schema.AnotherSchema`).

### Compiling Schemas

Apache Avro schemas (`.avsc` files) are often used directly by Avro libraries in various programming languages. These libraries can parse the schema definitions at runtime.

However, for some use cases, particularly for static type checking or performance optimization, you might want to compile schemas into language-specific code (e.g., Java classes, Python classes).

-   **Java:** Use the `avro-tools.jar` to compile schemas into Java classes.
    ```bash
    java -jar /path/to/avro-tools.jar compile schema <schema_file.avsc> <output_directory>
    ```
-   **Python:** Libraries like `fastavro` can compile schemas into Python modules for faster serialization/deserialization.
    ```python
    # Example using fastavro
    from fastavro.schema import load_schema
    from fastavro.codegen import CodeGenerator

    schema = load_schema('path/to/your_schema.avsc')
    codegen = CodeGenerator([schema])
    codegen.write_code('output_module.py')
    ```
    Refer to the documentation of the specific Avro library you are using for detailed instructions on schema compilation.

### Validating Schemas
To ensure that Avro schemas (`.avsc` files) in this directory are syntactically correct and valid according to the Avro specification, a validation script is provided.

Run the following command from the `cxs-schema` directory to validate all `.avsc` files in the `avro/` subdirectory:

```bash
python validate_avro_schemas.py
```
This script will parse each schema file and report any errors found.

### Using Generated Code

Once schemas are defined (and optionally compiled), you can use them in your application code to serialize and deserialize data.

-   **Python Example (using `avro` library):**
    ```python
    import avro.schema
    from avro.datafile import DataFileReader, DataFileWriter
    from avro.io import DatumReader, DatumWriter

    # Load schema
    schema = avro.schema.parse(open("path/to/semantic_event.avsc", "rb").read())

    # Writing Avro data
    writer = DataFileWriter(open("events.avro", "wb"), DatumWriter(), schema)
    # Example event (ensure it conforms to SemanticEvent schema)
    event_data = {
        "base_event_info": {
            "event_gid": "some-uuid-goes-here",
            "type": "example",
            "event": "Example Event Created",
            "timestamp": 1678886400000000, # Example timestamp in micros
            "message_id": "msg-id-123",
            "entity_gid": "entity-uuid-456"
        },
        # ... other fields like app, context, etc.
        "app": [{
            "name": "My Awesome App",
            "version": "1.2.3",
            "build": "100"
            # ... other app fields
        }]
    }
    writer.append(event_data)
    writer.close()

    # Reading Avro data
    reader = DataFileReader(open("events.avro", "rb"), DatumReader())
    for event in reader:
        print(event)
    reader.close()
    ```

-   **Java Example (using generated classes):**
    ```java
    // Assuming you have compiled SemanticEvent.avsc to com.contextsuite.schema.SemanticEvent
    // and BaseEventInfo.avsc to com.contextsuite.schema.BaseEventInfo, etc.

    // Creating an event
    BaseEventInfo baseInfo = BaseEventInfo.newBuilder()
        .setEventGid("some-uuid-goes-here")
        .setType("example")
        .setEvent("Example Event Created")
        .setTimestamp(1678886400000000L) // Example timestamp in micros
        .setMessageId("msg-id-123")
        .setEntityGid("entity-uuid-456")
        .build();

    App appInfo = App.newBuilder()
        .setName("My Awesome App")
        .setVersion("1.2.3")
        .setBuild("100")
        .build();

    SemanticEvent event = SemanticEvent.newBuilder()
        .setBaseEventInfo(baseInfo)
        .setApp(java.util.Arrays.asList(appInfo))
        // ... set other fields
        .build();

    // Serializing (example using SpecificDatumWriter and DataFileWriter)
    // try (DataFileWriter<SemanticEvent> dataFileWriter = new DataFileWriter<>(new SpecificDatumWriter<>(SemanticEvent.class))) {
    // dataFileWriter.create(event.getSchema(), new File("events.avro"));
    // dataFileWriter.append(event);
    // } catch (IOException e) {
    // e.printStackTrace();
    // }

    // Deserializing (example using SpecificDatumReader and DataFileReader)
    // try (DataFileReader<SemanticEvent> dataFileReader = new DataFileReader<>(new File("events.avro"), new SpecificDatumReader<>(SemanticEvent.class))) {
    // SemanticEvent readEvent = null;
    // while (dataFileReader.hasNext()) {
    // readEvent = dataFileReader.next(readEvent);
    // System.out.println(readEvent);
    // }
    // } catch (IOException e) {
    // e.printStackTrace();
    // }
    ```
    (Note: The Java serialization/deserialization part is commented out as it would require setting up a full Java environment and Avro dependencies to be runnable code within this subtask. The focus here is on schema documentation.)

Refer to the official Apache Avro documentation and the documentation for your chosen Avro library for more comprehensive examples and best practices.