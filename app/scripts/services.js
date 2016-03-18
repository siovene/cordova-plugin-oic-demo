'use strict';

angular.module('oic_demo.services', [])

.factory('DataService', function() {
    var _data = {
        devices: [],
        resources: []
    };

    return {
        data: _data,

        reset: function() {
            _data.devices = [];
            _data.resource = [];
        },

        devices: function() { return _data.devices; },
        resources: function() { return _data.resources; },

        addDevice: function(dev) {
            var found = false;

            angular.forEach(_data.devices, function(knownDevice) {
                if (knownDevice.uuid === dev.uuid) {
                    found = true;
                }
            });

            if (!found) {
                _data.devices.push(dev);
            }
        },
        addResource: function(res) {
            var found = false;

            angular.forEach(_data.resources, function(knownResource) {
                if (knownResource.id.deviceId === res.id.deviceId &&
                    knownResource.id.resourcePath === res.id.resourcePath)
                {
                    found = true;
                }
            });

            if (!found) {
                _data.resources.push(res);
            }
        }
    };
})

.factory('OICService', function(
    $interval, $ionicPlatform,
    DataService, SettingsService)
{
    var _plugin = null;

    function _ondevicefound(event) {
        DataService.addDevice(event.device);
    }

    function _onresourcefound(event) {
        DataService.addResource(event.resource);
    }

    function _setBackend(backend) {
        return _plugin.setBackend(backend);
    }

    function _findDevices() {
        return _plugin.findDevices();
    }

    function _getDevices() {
        return DataService.devices();
    }

    function _findResources(options) {
        return _plugin.findResources(options);
    }

    function _getResources() {
        return DataService.resources();
    }

    function _getResource(index) {
        var resources = DataService.resources();

        if (index < 0 || index > resources.length) {
            return null;
        }

        return resources[index];
    }

    function _updateResource(resource) {
        return _plugin.update(resource);
    }

    // Init
    $ionicPlatform.ready(function() {
        if (window.cordova !== undefined) {
            _plugin = window.cordova.require('cordova/plugin/oic');
            _plugin.ondevicefound = _ondevicefound;
            _plugin.onresourcefound = _onresourcefound;
            _setBackend('iotivity').then(function() {
                $interval(function() {
                    _findDevices();
                    _findResources(SettingsService.settings.resourceDiscovery);
                }, 2000);
            });
        }
    });

    return {
        // Functions
        setBackend: _setBackend,
        findDevices: _findDevices,
        getDevices: _getDevices,
        findResources: _findResources,
        getResources: _getResources,
        getResource: _getResource,
        updateResource: _updateResource
    };
})

.factory('SettingsService', function() {
    var _settings = {
        resourceDiscovery: {
            deviceId: '',
            resourcePath: '',
            resourceType: 'oic.r.light'
        }
    };

    return {
        settings: _settings
    };
});
