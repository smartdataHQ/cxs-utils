# Event Bible Local JSON Storage System

## Overview

The Event Bible system now uses a local JSON file as the primary data source, with Airtable as a fallback. This approach improves performance, reduces API calls, and provides better reliability.

## How It Works

### Data Flow Priority

1. **Local JSON File First**: All API requests check for local data at `data/event-bible/events.json`
2. **Airtable Fallback**: If no local data exists or file is empty, system loads from Airtable
3. **Automatic Saving**: When data is loaded from Airtable, it's automatically saved to the local JSON file

### File Structure

```
data/
└── event-bible/
    ├── events.json          # Main data file
    ├── backups/             # Automatic backups
    │   ├── events-backup-2025-01-17T10-30-00-000Z.json
    │   └── events-backup-2025-01-17T09-15-00-000Z.json
    └── .locks/              # Lock files (if needed)
```

### JSON File Format

```json
{
  "events": [
    {
      "airtable_id": "recXXXXXXXXXXXXXX",
      "airtableId": "recXXXXXXXXXXXXXX",
      "name": "Event Name",
      "description": "Event description",
      "category": "Category",
      "domain": "domain",
      "topic": "Topic Name",
      "aliases": [
        {
          "name": "Alias Name",
          "vertical": "Vertical",
          "topic": "Topic"
        }
      ],
      "lastUpdated": "2025-01-17T10:30:00.000Z",
      "deprecated": false,
      "deprecationReason": null,
      "deprecationDate": null,
      "replacementEvent": null
    }
  ],
  "filterOptions": {
    "categories": ["Category1", "Category2"],
    "domains": ["domain1", "domain2"],
    "verticals": ["Vertical1", "Vertical2"]
  },
  "metadata": {
    "lastUpdated": "2025-01-17T10:30:00.000Z",
    "source": "airtable",
    "eventsCount": 150,
    "version": "1.0.0"
  }
}
```

## Admin Interface

### Available Actions

1. **Refresh Cache**: Uses local JSON file if available, otherwise loads from Airtable
2. **Reload from Airtable**: Forces fresh data load from Airtable and updates local JSON file
3. **Clear Local Data**: Removes the local JSON file, forcing next request to load from Airtable
4. **Debug Airtable Data**: Shows raw Airtable field structure for troubleshooting

### Status Information

The admin interface shows:
- Local file existence and size
- Last modification date
- Events count in local file
- Data source (local vs Airtable)
- Available backups
- Cache statistics

## API Endpoints

### Modified Endpoints

All existing Event Bible API endpoints now check local data first:

- `GET /api/event-bible/events` - All events
- `GET /api/event-bible/events/[id]` - Event by ID
- `GET /api/event-bible/events/slug/[slug]` - Event by slug
- `GET /api/event-bible/filter-options` - Filter options
- `POST /api/event-bible/prime` - Cache priming

### New Endpoints

- `GET /api/event-bible/local` - Local file metadata and backup info
- `POST /api/event-bible/local/clear` - Clear local data file
- `POST /api/event-bible/local` - Restore from backup (with action parameter)

## Benefits

### Performance
- **Faster Response Times**: Local file access is much faster than API calls
- **Reduced Latency**: No network requests for cached data
- **Better User Experience**: Instant loading of event data

### Reliability
- **Offline Capability**: System works even if Airtable is unavailable
- **Reduced API Limits**: Fewer calls to Airtable API
- **Automatic Backups**: Previous versions are preserved

### Cost Efficiency
- **Lower API Usage**: Significant reduction in Airtable API calls
- **Bandwidth Savings**: Less data transfer over network

## Usage Patterns

### Development Workflow

1. **Initial Setup**: Run "Reload from Airtable" to populate local file
2. **Regular Use**: System automatically uses local data
3. **Data Updates**: Use "Reload from Airtable" when Airtable data changes
4. **Troubleshooting**: Use "Clear Local Data" to force fresh reload

### Production Deployment

1. **Deploy with Empty File**: System will auto-populate on first request
2. **Scheduled Updates**: Set up periodic "Reload from Airtable" calls
3. **Manual Updates**: Use admin interface when immediate updates needed

## Configuration

### Environment Variables

No additional environment variables needed. The system uses existing Airtable configuration:

- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_EVENTS_TABLE_ID`
- `AIRTABLE_ALIASES_TABLE_ID`

### File Permissions

Ensure the application has read/write access to:
- `data/event-bible/` directory
- `data/event-bible/events.json` file
- `data/event-bible/backups/` directory

## Backup System

### Automatic Backups
- Created before each file update
- Timestamped filenames
- Keeps last 10 backups automatically
- Stored in `data/event-bible/backups/`

### Manual Backup Management
- View backup list in admin interface
- Restore from specific backup (future feature)
- Manual cleanup if needed

## Troubleshooting

### Common Issues

1. **File Not Found**: System will automatically create and populate
2. **Corrupted JSON**: System validates and falls back to Airtable
3. **Permission Errors**: Check file system permissions
4. **Empty File**: Use "Reload from Airtable" to repopulate

### Debug Steps

1. Check admin interface for file status
2. Use "Debug Airtable Data" to verify Airtable connection
3. Check server logs for error messages
4. Verify file permissions and disk space

### Recovery Procedures

1. **Corrupted Local File**: Use "Clear Local Data" then "Reload from Airtable"
2. **Missing Backups**: System will recreate on next update
3. **API Failures**: Check Airtable credentials and network connectivity

## Migration Notes

### From Previous System
- Existing cache will continue to work
- Local file will be created on first Airtable load
- No breaking changes to existing API endpoints

### Data Consistency
- Local file is updated atomically
- Backups ensure data safety
- Validation prevents corrupted data

## Future Enhancements

### Planned Features
- Backup restoration interface
- Data synchronization checks
- Incremental updates
- Compression for large datasets
- Multi-environment support

### Monitoring
- File size monitoring
- Update frequency tracking
- Error rate monitoring
- Performance metrics

## Security Considerations

### Data Protection
- Local file contains same data as Airtable
- No additional sensitive information stored
- Standard file system permissions apply

### Access Control
- Admin interface requires appropriate authentication
- API endpoints maintain existing security
- File system access controlled by OS permissions