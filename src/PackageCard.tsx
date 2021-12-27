import React, { useEffect, useState } from "react";
import styles from "./PackageCard.module.scss";
import chartStyles from "./VersionDownloadChart.styles";

import { Text, IconButton, TooltipHost, ThemeProvider } from "@fluentui/react";

import { PackageIdentifier, packages } from "./PackageDescription";

import VersionDownloadChart from "./VersionDownloadChart";
import HistoryReader from "./HistoryReader";
import { lightTheme } from "./Themes";

export type VersionFilter = "major" | "patch" | "prerelease";

export type PackageCardProps = {
  identifier: PackageIdentifier;
  versionFilter: VersionFilter;
  hero?: boolean;
};

function maxDays(versionFilter: VersionFilter) {
  switch (versionFilter) {
    case "major":
      return 60;
    case "patch":
      return 30;
    case "prerelease":
      return 14;
  }
}

const PackageCard: React.FC<PackageCardProps> = ({
  identifier,
  versionFilter,
}) => {
  const [lastVersionFilter, setLastVersionFilter] = useState(versionFilter);
  const [showAsPercentage, setShowAsPercentage] = useState(false);
  const [historyReader, setHistoryReader] = useState<HistoryReader | null>(
    null
  );

  useEffect(() => {
    if (!historyReader) {
      (async () => {
        const reader = await HistoryReader.get(identifier);
        setHistoryReader(reader);
      })();
    }
  }, [historyReader, identifier]);

  useEffect(() => {
    if (versionFilter !== lastVersionFilter) {
      setShowAsPercentage(false);
      setLastVersionFilter(versionFilter);
    }
  }, [versionFilter, lastVersionFilter]);

  const historyPoints = historyReader?.getDatePoints(versionFilter);
  const packageDesc = packages[identifier];

  return (
    <CardFrame
      loaded={!!historyPoints}
      hasData={!!historyPoints && historyPoints.length > 0}
    >
      <ThemeProvider theme={lightTheme}>
        <div className={styles.header}>
          <div className={styles.headerLeft} />
          <div className={styles.headerText}>
            <Text variant="large" className={styles.packageName}>
              {packageDesc.friendlyName}
            </Text>
            <Text variant="medium">(Downloads/Week)</Text>
          </div>
          <div className={styles.headerControls}>
            <TooltipHost content="Show as percentage">
              <IconButton
                toggle
                aria-label="Show as percentage"
                disabled={!historyPoints || historyPoints.length === 0}
                iconProps={{ iconName: "CalculatorPercentage" }}
                checked={showAsPercentage}
                onClick={() => setShowAsPercentage(!showAsPercentage)}
              />
            </TooltipHost>
          </div>
        </div>

        {historyPoints ? (
          <div className={styles.chartContainer}>
            <VersionDownloadChart
              historyPoints={historyPoints}
              maxDaysShown={maxDays(versionFilter)}
              maxVersionsShown={7}
              measurementTransform={
                showAsPercentage ? "percentage" : "totalDownloads"
              }
              versionLabeler={packageDesc.versionLabeler}
            />
          </div>
        ) : (
          <div style={{ height: chartStyles.responsiveContainer.height }} />
        )}
      </ThemeProvider>
    </CardFrame>
  );
};

const CardFrame: React.FC<{
  loaded: boolean;
  hasData: boolean;
}> = ({ loaded, hasData, children }) => {
  return (
    <div
      className={`${styles.packageCardFrame} ${
        loaded
          ? hasData
            ? styles.visibleCardFrame
            : styles.noDataCardFrame
          : styles.fadedCardFrame
      }`}
    >
      <div
        className={`${styles.packageCardContent} ${
          loaded
            ? hasData
              ? styles.visibleCardContent
              : styles.noDataCardContent
            : styles.fadedCardContent
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default PackageCard;
