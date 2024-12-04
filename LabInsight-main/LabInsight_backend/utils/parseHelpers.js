exports.parseProcessDetails = function(content) {
    const lines = content.split('\n');
    const header = lines[0].split('\t');
  
    return lines.slice(1).map(line => {
      const values = line.split('\t');
      const processDetail = {};
  
      for (let i = 0; i < header.length; i++) {
        const fieldName = header[i].trim();
        const value = i < values.length ? values[i].trim() : '';
  
        switch (fieldName) {
          case 'PID':
            processDetail['PID'] = isNaN(Number(value)) ? value : Number(value);
            break;
          case 'Name':
            processDetail['Name'] = value;
            break;
          case 'Username':
            processDetail['Username'] = value;
            break;
          case 'CPU Percent':
            processDetail['CPU Percent'] = isNaN(Number(value)) ? value : Number(value);
            break;
          case 'Memory Usage (MB)':
            processDetail['Memory Usage (MB)'] = isNaN(Number(value)) ? value : Number(value);
            break;
          default:
            break;
        }
      }
  
      return processDetail;
    }).filter(process => process['Name'] && process['PID']);
  };
  
  exports.parseConnectedDevices = function(content) {
    const lines = content.split('\n');
    const header = lines[0].split('\t');
  
    return lines.slice(1).map(line => {
      const values = line.split('\t');
      const connectedDevice = {};
  
      for (let i = 0; i < header.length; i++) {
        const fieldName = header[i].trim();
        const value = i < values.length ? values[i].trim() : '';
  
        switch (fieldName) {
          case 'Device Type':
          case 'Device Name':
          case 'MAC Address':
          case 'Signal Strength':
          case 'Mount Point':
            connectedDevice[fieldName] = value;
            break;
          default:
            break;
        }
      }
  
      return connectedDevice;
    }).filter(device => device['Device Type'] && device['Device Name']);
  };
  