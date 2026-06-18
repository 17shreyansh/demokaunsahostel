import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Select, List, Typography, Tag, message, Spin, Collapse, Button, Space, Alert, Tooltip } from 'antd';
import { DeleteOutlined, ReloadOutlined, EnvironmentOutlined, PlusOutlined, ClearOutlined } from '@ant-design/icons';
import { FaGraduationCap, FaBuilding, FaBus, FaShoppingCart, FaHospital, FaFilm, FaUtensils, FaUniversity } from 'react-icons/fa';

const { Title, Text } = Typography;
const { Panel } = Collapse;

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

// Memoizing individual panels prevents the entire Accordion from re-rendering when one category changes
const CategoryPanel = memo(({ category, info, selectedPlaces, availableForSelection, onAddPlace, onRemovePlace }) => (
  <div className="bg-white p-4">
    {/* Selection dropdown */}
    <div className="mb-5">
      <Select
        placeholder={`Search & Select ${info.name.toLowerCase()}`}
        style={{ width: '100%' }}
        onSelect={(placeId) => onAddPlace(category, placeId)}
        value={undefined}
        showSearch
        virtual={false} // Prevents virtualization bugs if lists are small, enable if >1000 items
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
        disabled={availableForSelection.length === 0}
        notFoundContent={availableForSelection.length === 0 ? 'No more places available' : 'No places found'}
        size="large"
        className="shadow-sm"
      >
        {availableForSelection.map(place => (
          <Select.Option key={place._id} value={place._id}>
            {place.name} <span className="text-slate-400 text-xs ml-1">({place.type})</span>
          </Select.Option>
        ))}
      </Select>
    </div>

    {/* Selected places list */}
    {selectedPlaces.length > 0 ? (
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
        <List
          dataSource={selectedPlaces}
          size="small"
          renderItem={(place, index) => (
            <List.Item
              key={`${place._id}-${index}`}
              className="hover:bg-slate-100 transition-colors px-4 py-3 border-b last:border-b-0"
              actions={[
                <Tooltip title="Remove Place">
                  <Button
                    key="delete"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemovePlace(category, place._id)}
                    size="small"
                  />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center space-x-2">
                    <Text strong className="text-slate-800">{place.name}</Text>
                    <Tag color={info.color} className="text-[10px] border-0">{place.type}</Tag>
                  </div>
                }
                description={
                  <div className="mt-1">
                    {place.distance ? (
                      <Tag className="bg-blue-50 text-blue-600 border-blue-100" icon={<EnvironmentOutlined />}>
                        {place.distance}
                      </Tag>
                    ) : (
                      <Tag className="bg-slate-100 text-slate-500 border-slate-200">Pending calculation</Tag>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    ) : (
      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <info.icon className="w-8 h-8 mx-auto mb-3 text-slate-300" />
        <Text className="text-slate-500 font-medium block">No {info.name.toLowerCase()} selected</Text>
        <Text type="secondary" className="text-xs">Use the dropdown above to add locations.</Text>
      </div>
    )}
  </div>
));
CategoryPanel.displayName = 'CategoryPanel';

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const NearbyPlacesSelector = ({ coordinates, value = {}, onChange }) => {
  const [availablePlaces, setAvailablePlaces] = useState({});
  const [loading, setLoading] = useState(false);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCalculatedCoords, setLastCalculatedCoords] = useState(null);
  
  const categories = useMemo(() => ({
    educational: { name: 'Educational Institutions', color: 'green', icon: FaGraduationCap },
    office: { name: 'IT Parks & Offices', color: 'blue', icon: FaBuilding },
    transportation: { name: 'Transportation', color: 'purple', icon: FaBus },
    shopping: { name: 'Shopping', color: 'orange', icon: FaShoppingCart },
    healthcare: { name: 'Healthcare', color: 'red', icon: FaHospital },
    entertainment: { name: 'Entertainment', color: 'magenta', icon: FaFilm },
    restaurant: { name: 'Restaurants & Food', color: 'volcano', icon: FaUtensils },
    banking: { name: 'Banking & Finance', color: 'cyan', icon: FaUniversity }
  }), []);

  // Normalize value to ensure all categories exist safely
  const normalizedValue = useMemo(() => {
    const normalized = { ...value };
    Object.keys(categories).forEach(category => {
      if (!normalized[category] || !Array.isArray(normalized[category])) {
        normalized[category] = [];
      }
    });
    return normalized;
  }, [value, categories]);

  const hasSelectedPlaces = useCallback(() => {
    return Object.values(normalizedValue).some(places => places.length > 0);
  }, [normalizedValue]);

  // Safe network fetching on mount
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchAvailablePlaces = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const promises = Object.keys(categories).map(async category => {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces?category=${category}`, {
            signal: abortController.signal
          });
          if (!response.ok) throw new Error(`Failed to fetch ${category}`);
          return response.json();
        });
        
        const results = await Promise.all(promises);
        if (abortController.signal.aborted) return;

        const placesData = {};
        Object.keys(categories).forEach((category, index) => {
          placesData[category] = Array.isArray(results[index]) ? results[index] : [];
        });
        
        setAvailablePlaces(placesData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(`Failed to load nearby places: ${error.message}`);
          message.error('Database connection error');
        }
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    fetchAvailablePlaces();
    return () => abortController.abort();
  }, [categories]);

  // Auto-calculate distances when coordinates change - DISABLED to save API tokens
  // Only manual calculation via button click is allowed
  // useEffect(() => {
  //   const hasCoordinates = coordinates?.lat && coordinates?.lng;
  //   const coordsChanged = !lastCalculatedCoords || 
  //     lastCalculatedCoords.lat !== coordinates?.lat || 
  //     lastCalculatedCoords.lng !== coordinates?.lng;
  //   
  //   if (hasCoordinates && coordsChanged && hasSelectedPlaces()) {
  //     recalculateDistances();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [coordinates?.lat, coordinates?.lng]);

  const recalculateDistances = useCallback(async () => {
    if (!coordinates?.lat || !coordinates?.lng) {
      message.warning('Map coordinates are required for distance calculation.');
      return;
    }

    setDistanceLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces/distances?lat=${coordinates.lat}&lng=${coordinates.lng}`
      );
      
      if (!response.ok) throw new Error(`Distance API failed`);
      
      const placesWithDistances = await response.json();
      const updatedValue = { ...normalizedValue };
      let hasUpdates = false;
      
      Object.keys(categories).forEach(category => {
        if (updatedValue[category] && updatedValue[category].length > 0) {
          updatedValue[category] = updatedValue[category].map(place => {
            const withDistance = placesWithDistances.find(p => p._id === place._id);
            if (withDistance && withDistance.distance !== place.distance) {
              hasUpdates = true;
              return { ...place, distance: withDistance.distance };
            }
            return place;
          });
        }
      });
      
      if (hasUpdates) {
        onChange(updatedValue);
        setLastCalculatedCoords({ lat: coordinates.lat, lng: coordinates.lng });
        message.success('Geospatial distances synchronized.');
      }
    } catch (error) {
      message.error('Geospatial routing failed.');
    } finally {
      setDistanceLoading(false);
    }
  }, [coordinates, normalizedValue, categories, onChange]);

  const addPlace = useCallback(async (category, placeId) => {
    const place = availablePlaces[category]?.find(p => p._id === placeId);
    const selectedPlaces = normalizedValue[category] || [];
    
    if (!place) return;
    if (selectedPlaces.find(p => p._id === placeId)) {
      message.warning('Place already registered.');
      return;
    }

    // Add place without auto-calculating distance to save API tokens
    const updatedPlace = {
      _id: place._id,
      name: place.name,
      type: place.type,
      category: place.category,
      distance: null // Distance will be calculated manually via button
    };
      
    onChange({
      ...normalizedValue,
      [category]: [...selectedPlaces, updatedPlace]
    });
    
    message.success(`${place.name} added. Click "Calc Distances" to update distances.`);
    
  }, [availablePlaces, normalizedValue, onChange]);

  const removePlace = useCallback((category, placeId) => {
    const selectedPlaces = normalizedValue[category] || [];
    onChange({
      ...normalizedValue,
      [category]: selectedPlaces.filter(p => p._id !== placeId)
    });
  }, [normalizedValue, onChange]);

  const fetchAllNearbyPlaces = useCallback(async () => {
    if (!coordinates?.lat || !coordinates?.lng) {
      message.warning('Hostel coordinates missing. Please set map location first.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/nearbyplaces/distances?lat=${coordinates.lat}&lng=${coordinates.lng}`
      );
      
      if (!response.ok) throw new Error('API Request Failed');
      
      const placesWithDistances = await response.json();
      const groupedPlaces = {};
      
      Object.keys(categories).forEach(category => {
        groupedPlaces[category] = placesWithDistances
          .filter(place => place.category === category)
          .map(place => ({
            _id: place._id,
            name: place.name,
            type: place.type,
            category: place.category,
            distance: place.distance
          }));
      });
      
      onChange(groupedPlaces);
      
      const totalCount = Object.values(groupedPlaces).reduce((sum, places) => sum + places.length, 0);
      message.success(`Synchronized ${totalCount} nearby points of interest.`);
    } catch (error) {
      message.error(`Bulk import failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [coordinates, categories, onChange]);

  const clearAllPlaces = useCallback(() => {
    const emptyPlaces = {};
    Object.keys(categories).forEach(category => {
      emptyPlaces[category] = [];
    });
    onChange(emptyPlaces);
    message.info('Registry cleared.');
  }, [categories, onChange]);

  const getTotalSelectedCount = useCallback(() => {
    return Object.values(normalizedValue).reduce((total, places) => total + places.length, 0);
  }, [normalizedValue]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Enterprise Control Header */}
      <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={5} className="!mb-1 text-slate-800">
            Points of Interest Engine
          </Title>
          <div className="flex items-center text-xs font-medium">
            <span className="text-slate-500 mr-3">Active Registry: {getTotalSelectedCount()}</span>
            {coordinates?.lat && coordinates?.lng ? (
              <span className="text-emerald-600 flex items-center">
                <EnvironmentOutlined className="mr-1" /> Linked to GPS: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </span>
            ) : (
              <span className="text-amber-600 flex items-center">
                <EnvironmentOutlined className="mr-1" /> GPS Unlinked
              </span>
            )}
          </div>
        </div>

        <Space wrap>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => window.location.reload()} // Simplified refresh for demonstration, ideally call fetchAvailablePlaces
            disabled={loading}
          >
            Sync DB
          </Button>
          <Button 
            icon={<EnvironmentOutlined />} 
            onClick={recalculateDistances}
            loading={distanceLoading}
            disabled={!coordinates?.lat || !hasSelectedPlaces()}
          >
            Calc Distances
          </Button>
          <Button 
            icon={<ClearOutlined />} 
            onClick={clearAllPlaces}
            disabled={!hasSelectedPlaces()}
            danger
          >
            Clear
          </Button>
          <Button 
            icon={<PlusOutlined />} 
            onClick={fetchAllNearbyPlaces}
            loading={loading || distanceLoading}
            disabled={!coordinates?.lat}
            type="primary"
            className="bg-blue-600"
          >
            Auto-Fill
          </Button>
        </Space>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <Alert message="System Error" description={error} type="error" showIcon closable onClose={() => setError(null)} />
        </div>
      )}

      {(loading || distanceLoading) && (
        <div className="text-center py-6 bg-slate-50 border-b border-slate-200">
          <Spin size="default" />
          <div className="mt-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            {loading ? 'Synchronizing database...' : 'Executing geospatial routing...'}
          </div>
        </div>
      )}
      
      {/* Category Accordion */}
      <Collapse 
        defaultActiveKey={['educational']} 
        ghost
        className="bg-white"
        expandIconPosition="end"
      >
        {Object.entries(categories).map(([category, info]) => {
          const selectedPlaces = normalizedValue[category] || [];
          const availableCategoryPlaces = availablePlaces[category] || [];
          const availableForSelection = availableCategoryPlaces.filter(
            place => !selectedPlaces.find(p => p._id === place._id)
          );
          
          return (
            <Panel 
              key={category}
              className="border-b border-slate-100 last:border-b-0"
              header={
                <div className="flex items-center justify-between w-full pr-4 py-1">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${info.color}-50 text-${info.color}-600`}>
                      <info.icon size={16} />
                    </div>
                    <span className="font-semibold text-slate-800">{info.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedPlaces.length > 0 && (
                      <Tag color={info.color} className="border-0 font-bold">{selectedPlaces.length} Linked</Tag>
                    )}
                    <Tag className="bg-slate-100 text-slate-500 border-0">{availableCategoryPlaces.length} in DB</Tag>
                  </div>
                </div>
              } 
            >
              <CategoryPanel 
                category={category}
                info={info}
                selectedPlaces={selectedPlaces}
                availableForSelection={availableForSelection}
                onAddPlace={addPlace}
                onRemovePlace={removePlace}
              />
            </Panel>
          );
        })}
      </Collapse>
    </div>
  );
};

export default NearbyPlacesSelector;