package com.aazdoh.ai.dto;

public class SplitBlockDetail {

    private int blockIndex;
    private String title;
    private int minutes;
    private boolean scheduleTomorrow;

    public SplitBlockDetail() {
    }

    public SplitBlockDetail(int blockIndex, String title, int minutes, boolean scheduleTomorrow) {
        this.blockIndex = blockIndex;
        this.title = title;
        this.minutes = minutes;
        this.scheduleTomorrow = scheduleTomorrow;
    }

    public int getBlockIndex() {
        return blockIndex;
    }

    public void setBlockIndex(int blockIndex) {
        this.blockIndex = blockIndex;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getMinutes() {
        return minutes;
    }

    public void setMinutes(int minutes) {
        this.minutes = minutes;
    }

    public boolean isScheduleTomorrow() {
        return scheduleTomorrow;
    }

    public void setScheduleTomorrow(boolean scheduleTomorrow) {
        this.scheduleTomorrow = scheduleTomorrow;
    }
}
