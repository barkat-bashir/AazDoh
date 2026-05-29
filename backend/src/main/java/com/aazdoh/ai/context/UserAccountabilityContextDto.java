package com.aazdoh.ai.context;

import com.aazdoh.review.entity.FailureReason;
import com.aazdoh.user.entity.AiPersona;

import java.util.List;
import java.util.Map;

public class UserAccountabilityContextDto {

    private String userFullName;
    private String timezone;
    private AiPersona persona;
    private long totalCommitmentsLast7Days;
    private long completedCommitmentsLast7Days;
    private double completionRateLast7Days;
    private double avgDailyFocusMinutesLast7Days;
    private List<String> repeatedlyPostponedTitles;
    private Map<FailureReason, Long> topFailureReasons;

    public UserAccountabilityContextDto() {
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public AiPersona getPersona() {
        return persona;
    }

    public void setPersona(AiPersona persona) {
        this.persona = persona;
    }

    public long getTotalCommitmentsLast7Days() {
        return totalCommitmentsLast7Days;
    }

    public void setTotalCommitmentsLast7Days(long totalCommitmentsLast7Days) {
        this.totalCommitmentsLast7Days = totalCommitmentsLast7Days;
    }

    public long getCompletedCommitmentsLast7Days() {
        return completedCommitmentsLast7Days;
    }

    public void setCompletedCommitmentsLast7Days(long completedCommitmentsLast7Days) {
        this.completedCommitmentsLast7Days = completedCommitmentsLast7Days;
    }

    public double getCompletionRateLast7Days() {
        return completionRateLast7Days;
    }

    public void setCompletionRateLast7Days(double completionRateLast7Days) {
        this.completionRateLast7Days = completionRateLast7Days;
    }

    public double getAvgDailyFocusMinutesLast7Days() {
        return avgDailyFocusMinutesLast7Days;
    }

    public void setAvgDailyFocusMinutesLast7Days(double avgDailyFocusMinutesLast7Days) {
        this.avgDailyFocusMinutesLast7Days = avgDailyFocusMinutesLast7Days;
    }

    public List<String> getRepeatedlyPostponedTitles() {
        return repeatedlyPostponedTitles;
    }

    public void setRepeatedlyPostponedTitles(List<String> repeatedlyPostponedTitles) {
        this.repeatedlyPostponedTitles = repeatedlyPostponedTitles;
    }

    public Map<FailureReason, Long> getTopFailureReasons() {
        return topFailureReasons;
    }

    public void setTopFailureReasons(Map<FailureReason, Long> topFailureReasons) {
        this.topFailureReasons = topFailureReasons;
    }
}
