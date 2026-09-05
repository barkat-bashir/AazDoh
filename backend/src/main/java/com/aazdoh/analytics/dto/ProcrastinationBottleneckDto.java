package com.aazdoh.analytics.dto;

public class ProcrastinationBottleneckDto {
    private String title;
    private int postponementCount;
    private String firstSeenDate;
    private String latestStatus;

    public ProcrastinationBottleneckDto() {}

    public ProcrastinationBottleneckDto(String title, int postponementCount, String firstSeenDate, String latestStatus) {
        this.title = title;
        this.postponementCount = postponementCount;
        this.firstSeenDate = firstSeenDate;
        this.latestStatus = latestStatus;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public int getPostponementCount() { return postponementCount; }
    public void setPostponementCount(int postponementCount) { this.postponementCount = postponementCount; }
    public String getFirstSeenDate() { return firstSeenDate; }
    public void setFirstSeenDate(String firstSeenDate) { this.firstSeenDate = firstSeenDate; }
    public String getLatestStatus() { return latestStatus; }
    public void setLatestStatus(String latestStatus) { this.latestStatus = latestStatus; }
}
