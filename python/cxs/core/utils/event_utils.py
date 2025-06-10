import uuid
from datetime import datetime

def calculate_event_id(event_data=None, event_type=None, timestamp=None, entity_id=None):
    """
    Calculate a deterministic event ID based on the provided parameters.
    
    Args:
        event_data (dict, optional): Event data.
        event_type (str, optional): The type of event.
        timestamp (datetime, optional): Event timestamp.
        entity_id (str, optional): Entity ID associated with the event.
        
    Returns:
        str: A unique event ID as a UUID string.
    """
    id_components = []
    
    if event_data:
        id_components.append(str(event_data))
    
    if event_type:
        id_components.append(str(event_type))
    
    if timestamp:
        id_components.append(timestamp.isoformat())
    else:
        id_components.append(datetime.now().isoformat())
    
    if entity_id:
        id_components.append(str(entity_id))
    
    combined_string = ":".join(id_components)
    
    return str(uuid.uuid5(uuid.NAMESPACE_URL, combined_string))
