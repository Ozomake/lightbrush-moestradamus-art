import React, { useState, useMemo } from 'react';
import { useGameUI } from '../../store/gameStore';
import { usePlayerInventory, usePlayerEquipment, usePlayerStats } from '../../store/playerStore';
import { EquipmentSystem } from '../../game/systems/EquipmentSystem';
import type { PlayerEquipment } from '../../game/entities/Player';

const equipmentSystem = EquipmentSystem.getInstance();

type InventoryTab = 'all' | 'equipment' | 'software' | 'consumables';

export const Inventory: React.FC = () => {
  const { showInventory, hideInventoryModal } = useGameUI();
  const { inventory } = usePlayerInventory();
  const { equipment, equipItem, unequipItem, purchaseEquipment, getAvailableEquipment } = usePlayerEquipment();
  const { stats } = usePlayerStats();

  const [activeTab, setActiveTab] = useState<InventoryTab>('all');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);

  if (!showInventory) return null;

  // const allEquipment = equipmentSystem.getAllEquipment();
  const availableForPurchase = getAvailableEquipment();

  // Filter inventory items based on active tab
  const filteredInventory = useMemo(() => {
    const inventoryArray = Array.from(inventory.entries()).map(([id, count]) => ({
      id,
      count,
      item: equipmentSystem.getEquipmentItem(id)
    })).filter(entry => entry.item);

    switch (activeTab) {
      case 'equipment':
        return inventoryArray.filter(entry =>
          entry.item && ['projector', 'computer', 'controller'].includes(entry.item.type)
        );
      case 'software':
        return inventoryArray.filter(entry =>
          entry.item && ['software', 'accessory'].includes(entry.item.type)
        );
      case 'consumables':
        return inventoryArray.filter(entry =>
          entry.item && (entry.item.type as string) === 'consumable'
        );
      default:
        return inventoryArray;
    }
  }, [inventory, activeTab]);

  const handleEquipItem = (itemId: string) => {
    const item = equipmentSystem.getEquipmentItem(itemId);
    if (!item) return;

    let success = false;
    switch (item.type) {
      case 'projector':
        success = equipItem('projector', itemId);
        break;
      case 'computer':
        success = equipItem('computer', itemId);
        break;
      case 'controller':
        success = equipItem('controller', itemId);
        break;
    }

    if (success) {
      setSelectedItem(null);
    }
  };

  const handleUnequipItem = (slot: keyof Omit<PlayerEquipment, 'software' | 'accessories'>) => {
    unequipItem(slot);
  };

  const handlePurchaseItem = (itemId: string) => {
    const success = purchaseEquipment(itemId);
    if (success) {
      // Show success feedback
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-900';
      case 'uncommon': return 'border-green-500 bg-green-900/20';
      case 'rare': return 'border-blue-500 bg-blue-900/20';
      case 'epic': return 'border-purple-500 bg-purple-900/20';
      case 'legendary': return 'border-orange-500 bg-orange-900/20';
      default: return 'border-gray-500 bg-gray-900';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Inventory</h2>
              <p className="text-gray-400">Manage your equipment and items</p>
            </div>

            <div className="flex space-x-1">
              {([
                { id: 'all', label: 'All' },
                { id: 'equipment', label: 'Equipment' },
                { id: 'software', label: 'Software' },
                { id: 'consumables', label: 'Items' }
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowShop(!showShop)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              🛒 Shop
            </button>

            <div className="text-right">
              <div className="text-sm text-gray-400">Reputation</div>
              <div className="text-xl font-bold text-orange-400">{stats.reputation.toLocaleString()}</div>
            </div>

            <button
              onClick={hideInventoryModal}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Equipment Slots */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Equipped</h3>

            <div className="space-y-4">
              {/* Projector Slot */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Projector</div>
                {equipment.projector ? (
                  <EquippedItem
                    itemId={equipment.projector}
                    onUnequip={() => handleUnequipItem('projector')}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-2xl mb-2">📽️</div>
                    <div className="text-xs">No projector equipped</div>
                  </div>
                )}
              </div>

              {/* Computer Slot */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Computer</div>
                {equipment.computer ? (
                  <EquippedItem
                    itemId={equipment.computer}
                    onUnequip={() => handleUnequipItem('computer')}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-2xl mb-2">💻</div>
                    <div className="text-xs">No computer equipped</div>
                  </div>
                )}
              </div>

              {/* Controller Slot */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Controller</div>
                {equipment.controller ? (
                  <EquippedItem
                    itemId={equipment.controller}
                    onUnequip={() => handleUnequipItem('controller')}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-2xl mb-2">🎛️</div>
                    <div className="text-xs">No controller equipped</div>
                  </div>
                )}
              </div>

              {/* Software & Accessories */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Software ({equipment.software.length})</div>
                <div className="flex flex-wrap gap-1">
                  {equipment.software.map((softwareId, index) => {
                    const item = equipmentSystem.getEquipmentItem(softwareId);
                    return (
                      <div key={index} className="text-xl" title={item?.name}>
                        {item?.icon}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">Accessories ({equipment.accessories.length})</div>
                <div className="flex flex-wrap gap-1">
                  {equipment.accessories.map((accessoryId, index) => {
                    const item = equipmentSystem.getEquipmentItem(accessoryId);
                    return (
                      <div key={index} className="text-xl" title={item?.name}>
                        {item?.icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="flex-1 p-6 overflow-auto">
            {showShop ? (
              <ShopPanel
                availableItems={availableForPurchase}
                onPurchase={handlePurchaseItem}
                onClose={() => setShowShop(false)}
              />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    Items ({filteredInventory.length})
                  </h3>
                </div>

                <div className="grid grid-cols-8 gap-4">
                  {filteredInventory.map(({ id, count, item }) => {
                    if (!item) return null;

                    return (
                      <div
                        key={id}
                        className={`
                          relative rounded-lg p-3 cursor-pointer transition-all hover:scale-105 border-2
                          ${selectedItem === id ? 'ring-2 ring-blue-400' : ''}
                          ${getRarityColor(item.rarity)}
                        `}
                        onClick={() => setSelectedItem(selectedItem === id ? null : id)}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">{item.icon}</div>
                          <div className="text-xs text-gray-300 truncate">{item.name}</div>
                          {count > 1 && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {count}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, 32 - filteredInventory.length) }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="border-2 border-dashed border-gray-700 rounded-lg p-3 h-20"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Item Details Panel */}
          {selectedItem && (
            <ItemDetailsPanel
              itemId={selectedItem}
              onEquip={() => handleEquipItem(selectedItem)}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const EquippedItem: React.FC<{
  itemId: string;
  onUnequip: () => void;
}> = ({ itemId, onUnequip }) => {
  const item = equipmentSystem.getEquipmentItem(itemId);
  if (!item) return null;

  return (
    <div className="relative">
      <div className="text-center">
        <div className="text-2xl mb-1">{item.icon}</div>
        <div className="text-xs text-white font-medium truncate">{item.name}</div>
        <div className="text-xs text-gray-400 capitalize">{item.rarity}</div>
      </div>
      <button
        onClick={onUnequip}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
      >
        ×
      </button>
    </div>
  );
};

const ItemDetailsPanel: React.FC<{
  itemId: string;
  onEquip: () => void;
  onClose: () => void;
}> = ({ itemId, onEquip, onClose }) => {
  const { hasInInventory } = usePlayerInventory();
  const item = equipmentSystem.getEquipmentItem(itemId);

  if (!item) return null;

  const canEquip = ['projector', 'computer', 'controller'].includes(item.type) && hasInInventory(itemId);

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-auto">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-center flex-1">
            <div className="text-4xl mb-2">{item.icon}</div>
            <h3 className="text-lg font-bold text-white">{item.name}</h3>
            <p className="text-sm text-gray-400 capitalize">{item.rarity} {item.type}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-300 text-sm mb-4">{item.description}</p>

        {/* Stats */}
        {Object.keys(item.stats).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white mb-2">Stats</h4>
            <div className="space-y-1">
              {Object.entries(item.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between text-sm">
                  <span className="text-gray-400 capitalize">{stat.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-blue-400">+{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Effects */}
        {item.effects && item.effects.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white mb-2">Effects</h4>
            <div className="space-y-1">
              {item.effects.map((effect, index) => (
                <div key={index} className="text-sm text-green-400">
                  • {effect}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        {item.requirements && item.requirements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white mb-2">Requirements</h4>
            {item.requirements.map((req, index) => (
              <div key={index} className="text-sm text-gray-400">
                {req.skill} Level {req.level}
              </div>
            ))}
          </div>
        )}

        {canEquip && (
          <button
            onClick={onEquip}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Equip
          </button>
        )}
      </div>
    </div>
  );
};

const ShopPanel: React.FC<{
  availableItems: any[];
  onPurchase: (itemId: string) => void;
  onClose: () => void;
}> = ({ availableItems, onPurchase, onClose }) => {
  const { stats } = usePlayerStats();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Equipment Shop</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {availableItems.map(item => {
          const canAfford = stats.reputation >= item.cost;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-lg border-2 ${
                canAfford ? 'border-gray-600 hover:border-green-500' : 'border-red-600 opacity-50'
              } transition-all`}
            >
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium text-white">{item.name}</div>
                <div className="text-xs text-gray-400 capitalize">{item.rarity}</div>
              </div>

              <div className="text-center mb-3">
                <div className="text-lg font-bold text-orange-400">{item.cost.toLocaleString()}</div>
                <div className="text-xs text-gray-400">reputation</div>
              </div>

              <button
                onClick={() => onPurchase(item.id)}
                disabled={!canAfford}
                className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                  canAfford
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canAfford ? 'Purchase' : 'Cannot Afford'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;