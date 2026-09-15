import React, { useState, useEffect } from 'react';
import TradeServicePortal from './portals/TradeServicePortal';

interface ServiceCatalogProps {
  initialTrade?: 'plumbing' | 'electrical' | 'carpentry' | 'appliances';
  lang?: 'en' | 'hi';
  onSelectTrade?: (trade: 'plumbing' | 'electrical' | 'carpentry' | 'appliances') => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  initialTrade = 'plumbing',
  lang = 'en',
  onSelectTrade,
}) => {
  const [currentTrade, setCurrentTrade] = useState<'plumbing' | 'electrical' | 'carpentry' | 'appliances'>(initialTrade);

  useEffect(() => {
    if (initialTrade) {
      setCurrentTrade(initialTrade);
    }
  }, [initialTrade]);

  const handleSwitchPortal = (trade: 'plumbing' | 'electrical' | 'carpentry' | 'appliances') => {
    setCurrentTrade(trade);
    if (onSelectTrade) {
      onSelectTrade(trade);
    }
  };

  return (
    <TradeServicePortal
      portalId={currentTrade}
      onSwitchPortal={handleSwitchPortal}
      lang={lang}
    />
  );
};


export default ServiceCatalog;
