package com.fintrack.expense_tracker.dto;

public class AnalyticsResponseDTO {
    private double currentMonthTotal;
    private double prevMonthTotal;
    private double percentageChange;
    private String highestCategoryChange;
    private String trend; // "INCREASED" or "DECREASED" or "NO_CHANGE"

    public AnalyticsResponseDTO() {}

    public AnalyticsResponseDTO(double currentMonthTotal, double prevMonthTotal, double percentageChange, String highestCategoryChange, String trend) {
        this.currentMonthTotal = currentMonthTotal;
        this.prevMonthTotal = prevMonthTotal;
        this.percentageChange = percentageChange;
        this.highestCategoryChange = highestCategoryChange;
        this.trend = trend;
    }

    public double getCurrentMonthTotal() { return currentMonthTotal; }
    public void setCurrentMonthTotal(double currentMonthTotal) { this.currentMonthTotal = currentMonthTotal; }

    public double getPrevMonthTotal() { return prevMonthTotal; }
    public void setPrevMonthTotal(double prevMonthTotal) { this.prevMonthTotal = prevMonthTotal; }

    public double getPercentageChange() { return percentageChange; }
    public void setPercentageChange(double percentageChange) { this.percentageChange = percentageChange; }

    public String getHighestCategoryChange() { return highestCategoryChange; }
    public void setHighestCategoryChange(String highestCategoryChange) { this.highestCategoryChange = highestCategoryChange; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }
}
